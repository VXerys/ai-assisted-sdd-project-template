# Benchmark: template SDD vs repo serupa (2026-10-22)

Catatan riset template-maintainer. Bukan keputusan; keputusan masuk lewat amandemen ADR-0002 atau ADR baru. Semua halaman di bawah di-fetch 2026-10-22. Label: VERIFIED (dicek ulang dari sumber resmi oleh sesi utama), HIGH/MEDIUM (dari laporan riset dengan URL), UNVERIFIED.

## 1. Posisi saat ini

| Hal | Status | Bukti |
|---|---|---|
| Rilis terakhir | v2.0.0, 2026-10-15 (ADR-0001), merged ke `main` lewat PR #5 | `git log`, `CHANGELOG.md` |
| Pekerjaan aktif | v2.1 hardening (ADR-0002), phase 1 dari 5, branch `feat/v2.1-phase-1-hardening` (belum di-push) | `git branch -a` |
| Sudah di-commit | `71b3c85` (2026-10-16, WIP): batch A bug fixes 1-7, batch B validator trust rules 8-14 | `git show --stat 71b3c85` |
| Belum di-commit | `init` mengganti CI template dengan job `verify` dari preset; key `ci` di app preset; CHANGELOG Unreleased; README | `git diff --stat` (16 file) |
| Belum dikerjakan | batch C: guard coverage dan docs. `.claude/settings.json` masih `Edit\|Write\|MultiEdit` | `.claude/settings.json` |
| Kesehatan | `npm test` 143/143 pass (~419 s di Windows); `context:validate --strict` 0 error 0 warning | dijalankan 2026-10-22 |
| Versi package | masih `2.0.0` | `package.json` |

Alasan v2.1 (ringkas dari ADR-0002): audit setelah rilis menemukan bug yang langsung kena project turunan pertama (CI turunan gagal, hook diam-diam mati tanpa `node_modules`, preset Supabase menulis `db reset`), evidence palsu (`command: echo pass`) lolos validator, tooling tersalin ke tiap project sehingga fix tidak menyebar, dan owner mulai memakai beberapa cloud agent paralel.

## 2. Temuan yang mengubah rencana v2.1

1. **npm 12 memblokir git dependency secara default.** "As of npm 12 the default is `none`" untuk `allow-git`. Rencana `"@vxerys/sdd": "github:VXerys/sdd#v2.1.0"` akan gagal install tanpa opt-in `.npmrc` (`allow-git=root`). VERIFIED: https://docs.npmjs.com/cli/v12/commands/npm-install
2. **Hook repo berjalan di cloud session satu-repo; tidak di multi-repo dan project thread.** Plugin yang di-enable repo tidak ter-install di cloud. Jadi hookless parity tetap perlu, terutama untuk PM malam yang multi-repo; plugin tidak bisa jadi satu-satunya jalur distribusi. VERIFIED: https://code.claude.com/docs/en/cloud-environments
3. **Guard bisa dilewati lewat tool `PowerShell`.** Daftar tool hook resmi memuat `Bash` dan `PowerShell`; ADR-0002 hanya menyebut Bash dan NotebookEdit. HIGH: https://code.claude.com/docs/en/hooks
4. **Root project salah di worktree.** `projectRoot()` di `scripts/lib/hook-io.mjs:28` memprioritaskan `CLAUDE_PROJECT_DIR`, yang menurut docs tetap di checkout utama saat sesi masuk worktree, sementara `payload.cwd` mengikuti worktree. Dugaan: edit `.claude/worktrees/x/AGENTS.md` dihitung relatif ke root utama dan tidak cocok glob `generated`. Kode VERIFIED; dampaknya perlu test reproduksi. HIGH: https://code.claude.com/docs/en/hooks
5. **Hampir semua tool sekarang membaca AGENTS.md native.** Claude Code (kalau tidak ada CLAUDE.md; `@AGENTS.md` tidak dibaca dua kali), Codex (batas gabungan 32 KiB), Cursor, Kiro (selalu disertakan), Copilot (dibaca bersama `copilot-instructions.md`). Adapter yang menyalin isi AGENTS.md jadi termuat dua kali. HIGH: https://agents.md/, https://code.claude.com/docs/en/memory, https://kiro.dev/docs/steering/, https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
6. **`.claude/commands/` sudah digabung ke skills.** Skill bisa `disable-model-invocation: true` untuk perintah dengan efek samping. HIGH: https://code.claude.com/docs/en/skills

## 3. Ide dari repo serupa

| Ide | Sumber | Status di ADR-0002 |
|---|---|---|
| Manifest hash untuk managed files; upgrade berhenti pada file yang diedit user; `status` | spec-kit https://github.github.io/spec-kit/upgrade.html | sebagian (merge-file ada, manifest belum) |
| Upgrade ala copier: bangun ulang base dari versi + jawaban init, 3-way merge per file, `--conflict inline\|rej`, migrasi per versi | https://copier.readthedocs.io/en/stable/updating/ | sebagian |
| `check` yang exit 1 kalau project tertinggal versi (untuk CI) | cruft https://cruft.github.io/cruft/ | belum |
| `converge`: bandingkan kode vs AC, tambahkan task gap ke `tasks.md`, bukan sekadar pass/fail | spec-kit `templates/commands/converge.md` | belum |
| Format `analyze`: tabel severity, batas 50 temuan, coverage % | spec-kit `templates/commands/analyze.md` | sebagian |
| Bugfix spec: current, expected, unchanged behavior ("SHALL CONTINUE TO") | Kiro https://kiro.dev/docs/specs/bugfix-specs/ | belum |
| `targets` glob per fitur dan link test per AC, divalidasi | Tessl https://tessl.io/registry/tessl-labs/spec-driven-development | belum (AC-to-test stub ditunda) |
| Wave paralel dari dependency graph | Kiro https://kiro.dev/docs/specs/, cc-sdd https://github.com/gotalab/cc-sdd | sebagian (scope check ada, view belum) |
| `status --json` / next task untuk routine | OpenSpec https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md | sebagian |
| Brownfield adopt: blok bertanda di AGENTS.md + commit tercatat + pitfalls log | BMAD https://docs.bmad-method.org/existing-codebases/set-and-maintain-project-context/ | belum |
| Implementer dan reviewer terpisah per task | cc-sdd, obra/superpowers https://github.com/obra/superpowers | tercakup (verifier subagent) |
| Delta specs + archive | OpenSpec https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md | tidak disarankan sekarang (berat untuk satu owner) |

Yang sebaiknya dihindari: menimpa file managed yang diedit user (spec-kit, OpenSpec); validator yang menerima heading rusak (OpenSpec #2078, #2132); output markdown yang terlalu banyak per fitur; membangun ulang fitur yang sudah native di host tool (pelajaran agent-os 3.0, https://github.com/buildermethods/agent-os/blob/main/CHANGELOG.md); bergantung pada Vibe Kanban yang sedang sunset.

## 4. Rekomendasi berprioritas

### P0, masuk batch C phase 1 (kecil, menutup celah nyata)

1. Commit pekerjaan CI-replacement yang sudah hijau sebelum mulai batch C.
2. Matcher PreToolUse: `Edit|Write|MultiEdit|NotebookEdit|Bash|PowerShell`, dengan parser perintah shell untuk redirect, `sed -i`, `Set-Content`, `Out-File`, dan bacaan `.env*`.
3. Root dari `payload.cwd` (git top level), fallback `CLAUDE_PROJECT_DIR`; tambah test hook untuk path di `.claude/worktrees/`.
4. CI: matrix `ubuntu-latest` + `windows-latest`, ganti `rsync` dengan skrip copy Node, pin action ke SHA, dependabot untuk `github-actions`.
5. Test: pisah `test:unit` dan `test:e2e`, pecah `init.test.mjs` per preset agar `--test-concurrency` bekerja, init fixture sekali di `before()`. https://nodejs.org/api/test.html

### P1, amandemen ADR-0002 sebelum phase 2 (ekstraksi package)

6. Distribusi: putuskan antara publish npm lebih awal (trusted publishing OIDC, provenance hanya untuk repo publik, https://docs.npmjs.com/trusted-publishers) atau dokumentasikan `allow-git=root` di `.npmrc` project turunan.
7. `sdd upgrade` = manifest hash + rebuild base ala copier + `git merge-file` + `--dry-run --json` + migrasi per versi; tambah `sdd check`.
8. Distribusi Claude Code: repo-local `.claude/` + package tetap jalur utama; plugin hanya opsi lokal. Install package di cloud lewat SessionStart hook yang mengecek `CLAUDE_CODE_REMOTE`.
9. Persempit scope hookless parity ke multi-repo session, project thread, dan tool tanpa hook.
10. Adapter tanpa duplikasi: AGENTS.md tipis (sekarang 281 baris; target 120), adapter lain hanya berisi aturan per file (`.cursor/rules`, `.kiro/steering`, `.github/instructions`), GEMINI.md diganti `context.fileName`. Steering `fileMatch` untuk Claude dirender ke `.claude/rules/*.md` dengan `paths:`, bukan disuntik dari PreToolUse.
11. Migrasi `.claude/commands/sdd/` ke `.claude/skills/`.

### P2, fitur phase 3-5

12. `/sdd:converge` (gap jadi task baru).
13. Template bugfix dengan bagian unchanged behavior dan EV wajib untuknya.
14. `targets` per fitur dan `tests:` per AC, dicek validator.
15. `sdd next --json` dan baris "parallel-safe now" di BRIEF dari `depends_on` + `scope`.
16. `sdd adopt` untuk brownfield + pitfalls log.
17. Batasan scheduled task untuk routine: interval minimal 1 jam, branch `claude/`, prompt tersimpan bukan persetujuan owner, trigger PR untuk review. https://code.claude.com/docs/en/routines

### P3, hygiene repo

18. `LICENSE` (belum ada; perlu keputusan owner soal lisensi), `SECURITY.md`, `CODEOWNERS`, ruleset `main`.
19. release-please untuk release PR dari conventional commits, plus job publish terpisah. https://github.com/googleapis/release-please

## 5. Tindak lanjut (2026-10-22, sesi yang sama)

Keputusan owner: lisensi MIT, CLI tetap di repo ini, `allow-git` + workflow npm disiapkan tanpa publish, commit lokal per prioritas tanpa push. Rekap ada di `CHANGELOG.md` [Unreleased] dan ADR-0003.

| Prioritas | Branch | Status |
|---|---|---|
| P0 (1-5) | `feat/v2.1-phase-1-hardening` | selesai |
| P1 (6-11) | `feat/v2.1-p1-distribution` | selesai; nomor 11 diputuskan lain: `.claude/commands/` dipertahankan (nama `/sdd:*` adalah kontrak) dan diberi `disable-model-invocation`, tidak dimigrasi ke skills |
| P2 (12-17) | `feat/v2.1-p2-spec-quality` | selesai |
| P3 (18-19) | `feat/v2.1-p3-repo-hygiene` | selesai di file; ruleset GitHub, private vulnerability reporting, dan aktivasi `NPM_PUBLISH` adalah pengaturan owner di GitHub |

Belum dikerjakan, tetap di ADR-0002: ekstraksi package `@vxerys/sdd` ke repo terpisah, `sdd verify`, verifier subagent, Stop yang memblokir, klaim multi-agent via draft PR, shim hook untuk tool lain, spec lint, `/sdd:analyze`, `/sdd:clarify`, `examples/flutter-supabase`.

## 6. Gap riset

- Pemetaan hook Claude Code oleh Cursor (halaman 404), daftar trigger Kiro lengkap, dan apakah `MultiEdit` masih ada: UNVERIFIED.
- Angka token dari vendor (Task Master, spec-workflow, benchmark BMAD) berkualitas rendah; tidak dipakai sebagai dasar keputusan.
- Tanggal rilis spec-kit 1.2.2 dan OpenSpec 1.14.3 tidak tercantum lengkap di sumbernya.
