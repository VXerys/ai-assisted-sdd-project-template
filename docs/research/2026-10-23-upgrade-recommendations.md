# Rekomendasi upgrade template SDD (2026-10-23)

Catatan riset template-maintainer, lanjutan `2026-10-22-sdd-landscape-benchmark.md`. Bukan keputusan; keputusan masuk lewat ADR baru. Tujuan owner: template dipakai untuk pribadi dan orang lain.

Label: VERIFIED (dijalankan di mesin ini atau dibaca dari sumber resmi oleh sesi utama), HIGH (laporan riset dengan URL ke halaman resmi, dibaca 2026-10-23), MEDIUM (sumber sekunder), UNVERIFIED, INFERENSI (kesimpulan, belum diuji). Angka bintang GitHub dibaca peneliti dari halaman repo pada 2026-10-23 dan dibulatkan; bukan dasar keputusan.

## 1. Ringkasan

1. Template sehat tetapi belum dirilis: `npm test` 171/171, `context:validate --strict` 0 error 0 warning, `package.json` masih `2.0.0`, seluruh pekerjaan v2.1 masih di `[Unreleased]`. Rilis 2.1.0 adalah langkah pertama, bukan fitur baru.
2. Bukti dogfooding paling kuat ada di disk: 10 project turunan v2 (sekitar 370 task, 326 blok EV, 360 FR, 800 AC dalam 8 hari). Semuanya di-init dari v2.0.0 tanpa `template` record, dan semuanya gagal di validator 2.1 (5 sampai 206 error per project). Dua kelas error mendominasi: `command` EV tidak ada di tabel `tech.md`, dan `commit` EV tidak ada di `git log`. Artinya aturan trusted-evidence 2.1 benar arahnya tetapi salah bentuknya: agent menulis evidence komposit (beberapa perintah, pemeriksaan browser, commit repo lain, working tree belum di-commit) dan tidak ada yang memakai prefix `manual:`. Perbaikannya adalah EV terstruktur plus `sdd verify` yang menulis EV sendiri, bukan validator yang lebih ketat.
3. Dari enam kategori repo yang belum di-benchmark kemarin, lima ide paling layak diambil: `ac_hash` di EV (Doorstop), claim atomik dengan lease dan `reconcile` (beads, Symphony, Paperclip), `TRACE.md` matriks FR x AC x T x EV (OpenFastTrace, sphinx-needs), `permissions.deny` native yang dirender dari daftar secret/frozen (lnai), dan `npm create sdd` lewat giget (spec-kit, claude-code-templates).
4. Fitur Claude Code 2026 yang langsung memperbaiki gate dengan biaya kecil: `onFailure: "block"` pada hook guard, `PostToolBatch` untuk render sekali per batch, `TaskCompleted` hook, cap blok Stop hook, subagent `isolation: worktree`, `memory: project` yang menulis `.claude/agent-memory/` (perlu kebijakan).
5. Untuk dipakai orang lain, yang kurang bukan fitur melainkan jalur masuk: publish npm, satu perintah install, docs site, README Indonesia, demo, file hygiene komunitas, plugin marketplace sebagai discovery.

## 2. Posisi saat ini

| Hal | Status | Bukti (VERIFIED, 2026-10-23) |
|---|---|---|
| Branch | `chore/align-pinned-actions`, clean, sudah merge ke `main` lewat PR #8 | `git status`, `git log` |
| Test | 171 pass, 0 fail, 410 s (Windows, Node 24.18) | `npm test` |
| Validator | 0 error, 0 warning, strict, 75 Markdown, 0 feature | `npm run context:validate -- --strict` |
| Versi | `package.json` 2.0.0; CHANGELOG `[Unreleased]` memuat semua v2.1; release-please siap | `CHANGELOG.md`, `release-please-config.json` |
| Hook | 4 event: SessionStart, PreToolUse, PostToolUse, Stop; tanpa `permissions` | `.claude/settings.json` |
| `.claude/` | `commands/sdd/` (7), `rules/` (3), `settings.json`; tanpa `agents/`, `skills/`, `workflows/`, `.claude-plugin/` | `find .claude` |
| Komunitas | `LICENSE`, `SECURITY.md`, `CODEOWNERS`, PR template, dependabot; tanpa issue template, CODE_OF_CONDUCT, SUPPORT, devcontainer, docs site, README terjemahan, demo | `ls .github`, README |
| `.gitignore` | belum memuat `.claude/worktrees/` dan `.claude/agent-memory/` | `.gitignore` |
| Template EV | field `command`, `output`, `date`, `commit`, `covers`; tanpa `kind` atau `captured` | `docs/specs/_templates/verification.md` |

Catatan pada `scripts/hooks/session-start.mjs:12`: `CLAUDE_PROJECT_DIR || cwd` hanya dipakai untuk `npm ci` di cloud session; brief memakai `projectRoot(payload)` (baris 27), jadi dugaan peneliti bahwa brief checkout utama tersuntik ke sesi worktree tidak terbukti. Sisa risiko kecil: cloud session di worktree tanpa `node_modules` menjalankan `npm ci` di checkout utama.

## 3. Bukti dogfooding: 10 project turunan

Dihitung read-only pada 2026-10-23 dengan validator template (bukan salinan validator 2.0.0 di masing-masing project). Setiap project punya salinan tooling 2.0.0 sendiri, sehingga di mata validatornya sendiri mungkin hijau; angka di sini menunjukkan apa yang terjadi saat mereka di-upgrade ke 2.1.

| Project | App, tier | F | T | EV | FR / AC | Handoff | A open | `.claude/` ekstra | Error 2.1 |
|---|---|---|---|---|---|---|---|---|---|
| bookmate-web | nextjs, lite | 14 | 48 | 35 | 47 / 110 | active | 8 | launch.json | 50 |
| fluxa-web | nextjs, full | 3 | 24 | 4 | 25 / 61 | active | 10 | launch.json | 11 |
| interior-serang-web | nextjs, lite | 1 | 10 | 3 | 3 / 5 | active | 8 | (0 commit) | 5 |
| inzta-investor-portal | nextjs, full | 11 | 39 | 30 | 41 / 84 | active | 3 | launch.json | 35 |
| loopday-app | flutter, lite | 8 | 44 | 59 | 43 / 120 | active | 1 | agents, skills, worktrees | 113 |
| mangcoding-ui8-starter | flutter, lite | 0 | 0 | 0 | 0 / 0 | inactive | 1 | agents, skills | 9 (render stale) |
| sechan-portfolio | nextjs, lite | 9 | 36 | 27 | 32 / 52 | active | 3 | launch.json | 56 |
| sechan-portfolio-f011 | nextjs, lite | 11 | 50 | 34 | 39 / 69 | active | 2 | launch.json | 63 |
| sechan-portfolio-marquee | nextjs, lite | 11 | 50 | 34 | 39 / 69 | active | 2 | launch.json | 63 |
| trivia-app | flutter, lite | 10 | 69 | 100 | 92 / 236 | active | 66 | agents, skills, worktrees | 206 |

Tidak satu pun punya `template` record atau `.sdd/manifest.json` (semua init sebelum 2.1).

### Kelas error (gabungan 10 project)

611 error dan 22 warning di 10 project (VERIFIED, validator template, 2026-10-23).

| Kelas | Jumlah | Bagian | Penyebab | Perbaikan yang diusulkan |
|---|---|---|---|---|
| EV `command` tidak ada di tabel `tech.md` | 308 | 50% | evidence komposit, pemeriksaan browser, FVM, REA; prefix `manual:` tidak pernah dipakai | N3 EV terstruktur, N4 `sdd verify`, N2 legacy |
| EV `commit` tidak ada di `git log` | 224 | 37% | commit ditulis sebelum commit terjadi, hash repo lain, teks bebas ("lihat commit ...") | N3 `commit: pending` dan `<repo>@<sha>`, N8 trailer `Task:`, N2 legacy |
| adapter stale | 42 | 7% | render 2.0 vs renderer 2.1 (AGENTS.md tipis); hilang sendiri setelah `sdd upgrade` | tidak ada |
| task `done` tetapi evidence tidak mencakup AC dari FR-nya | 14 | 2% | `covers` menunjuk AC lain atau kosong | N9 `TRACE.md` membuatnya terlihat; `sdd verify` mengisi `covers` dari task |
| assumption tanpa `feature:` atau `feature: none` | 15 | 2% | aturan 2.1 baru | migrasi `sdd upgrade` mengisi `feature:` dari konteks, sisanya warning |
| rendered view stale | 8 | 1% | edit di luar hook | N10 gate pre-commit |
| warning: file melebihi cap lite 80 baris | 18 | | 18 file antara 87 dan 294 baris di project lite | keputusan owner: naikkan cap lite (120?) atau validator menyarankan pindah ke `full` |

Per project, dua kelas pertama menyumbang 68% (bookmate-web) sampai 96% (trivia-app) dari error. Hanya mangcoding-ui8-starter (kosong) yang errornya murni artefak render.

### Yang terbaca dari data

1. **Upgrade adalah fitur yang akan dipakai pertama kali oleh 10 project sekaligus**, semuanya lewat jalur `--base-ref v2.0.0 --answers answers.json`. Jawaban init sebenarnya sudah ada di `sdd.config.json` (`name`, `tier`, `app`, `database`, `tools`); yang kurang hanya `owner` (ada di git config), `lang`, `description`, `date`. `sdd upgrade` bisa menyimpulkannya sendiri dan hanya bertanya yang tidak ada. INFERENSI, belum diuji.
2. **Evidence nyata tidak berbentuk satu perintah dari `tech.md`.** Contoh yang ditolak validator 2.1: gabungan `lint && typecheck && test && build`, pemeriksaan browser pada viewport tertentu, rekaman REA, perintah FVM (`.fvm/flutter_sdk/bin/flutter analyze`), commit repo lain (portal merujuk ERP), "belum di-commit (working tree)". Konvensi prefix `manual:` tidak dipakai oleh agent mana pun. Bentuk yang cocok: field `kind: command | manual | browser | external`, `commands:` daftar, `commit: <repo>@<sha>` untuk repo lain, `commit: pending` hanya selama task belum `done`; dan `sdd verify` yang menulis blok itu sendiri sehingga agent berhenti mengetik evidence.
3. **Migrasi evidence lama harus ada di `sdd upgrade`.** Tanpa itu, upgrade menghasilkan puluhan sampai ratusan error dan owner akan mematikan validator. Aturan paling sederhana: EV yang tanggalnya lebih tua dari tanggal upgrade dicap `legacy: true` dan pelanggaran aturan trust pada EV legacy menjadi warning.
4. **Kerja paralel sudah terjadi sebelum fiturnya ada.** loopday-app dan trivia-app memakai `.claude/worktrees/`, `agents/` (`ui8-*`), dan `skills/`; sechan-portfolio punya 9 feature `implementing` sekaligus. Klaim task dengan lease (ADR-0002 phase 4) bukan fitur masa depan lagi; dan `.claude/agents/`, `.claude/skills/`, `.claude/worktrees/` perlu status jelas: milik project (tidak managed, tidak dihapus upgrade), `worktrees/` di-gitignore, `sdd adopt` mengimpornya.
5. **Assumptions tidak terkendali di project besar.** trivia-app punya 66 assumption `open`; brief 3.000 token tidak mungkin memuatnya. Brief harus memuat hanya assumption feature aktif, dan `/sdd:clarify` harus bisa menutup banyak assumption sekaligus.
6. **Hook tidak selalu menyala.** mangcoding-ui8-starter punya rendered view stale, berarti ada edit di luar PostToolUse (Bash, tool lain, editor). Gate di level git (pre-commit yang menjalankan `sdd render --check` dan `sdd guard --check`) berlaku untuk semua tool dan tidak bergantung pada Claude Code.
7. **`launch.json` ada di 7 project**: konfigurasi preview desktop app. Preset app bisa menulis `.claude/launch.json` default (dev server per preset) supaya `run` langsung jalan.

## 4. Repo relevan yang belum di-benchmark kemarin

Semua baris: HIGH (dari laporan riset dengan URL resmi) kecuali ditandai lain.

### A. Sinkronisasi rule lintas tool (pesaing `adapters:sync`)

| Nama | URL | Bintang | Aktivitas | Ide untuk template |
|---|---|---|---|---|
| ruler | github.com/intellectronica/ruler | ~3,0k | v0.3.46, 22 Okt | `revert` dan blok `.gitignore` terkelola, supaya pengguna memilih commit atau ignore file hasil render |
| rulesync | github.com/dyoshikawa/rulesync | ~1,5k | v40.2.0, 2026-10-22 | `import`/`convert` dari CLAUDE.md, `.cursorrules`, copilot-instructions yang sudah ada, sebagai masukan `sdd adopt`; target render `.agents/skills/` (standar Agent Skills); matriks fitur per tool di README |
| ai-rulez | github.com/Goldziher/ai-rulez | 163 | v5.6.2, 2026-10-21 | `generate --check` exit 2 saat drift (kita sudah punya); `include` remote yang dikunci lockfile untuk rule pack bersama; composite GitHub Action |
| ai-rules (Block) | github.com/block/ai-rules | 139 | v1.7.0 | `clean` untuk opt-out satu tool |
| lnai | github.com/KrystianJonca/lnai | 243 | v0.6.92 | merender daftar secret dan frozen sebagai `permissions.deny` native, bukan hanya hook |

Jangan ganti `adapters:sync` dengan salah satunya: tidak ada yang mengerti frozen path atau validasi file render yang diedit tangan. Yang masuk akal adalah ekspor ke format mereka.

### B. Distribusi dan developer experience

| Nama | URL | Bintang | Yang mereka kirim dan kita belum |
|---|---|---|---|
| spec-kit (distribusi saja) | github.com/github/spec-kit | ~142k | `uv tool install`, docs site GitHub Pages, katalog extension/preset/workflow, `.devcontainer`, README ja/ko/zh-CN, CITATION.cff, SUPPORT.md, CODE_OF_CONDUCT; 1.2.3 (2026-10-22) menambah `.presetignore` |
| claude-code-templates | github.com/davila7/claude-code-templates | ~33k | `npx claude-code-templates@latest --command/--agent`, katalog web, `.claude-plugin/`, Discussions, screenshot |
| vercel-labs/skills | github.com/vercel-labs/skills | ~36k | `npx skills add owner/repo` untuk puluhan agent, direktori skills.sh, `check`/`update` |
| Anthropic marketplaces | code.claude.com/docs/en/plugins | | marketplace sendiri = `.claude-plugin/marketplace.json` di repo; `marketplace add --scope project` menulis `.claude/settings.json`; `claude plugin validate --strict` untuk CI; directory resmi butuh paket berbayar |
| awesome-claude-code | github.com/hesreallyhim/awesome-claude-code | ~56k | submission lewat issue form; syarat riwayat 14 hari aktif atau 100 bintang |
| giget, `npm create` | github.com/unjs/giget | 780 | `npm create sdd` menjalankan paket `create-sdd`; giget mengambil subfolder repo dengan cache offline (degit tidak dirawat sejak 2021) |

### C. Task tracker git-native untuk agent

| Nama | URL | Bintang | Aktivitas | Ide untuk template |
|---|---|---|---|---|
| beads | github.com/steveyegge/beads | ~28k | v1.3.2-rc.3 | `sdd claim T-xxx` / `sdd next --claim`: satu tulisan yang mengisi `claimed_by` dan `in_progress`; `bd ready` = tanpa blocker terbuka |
| Backlog.md | github.com/MrLesk/Backlog.md | ~7k | v1.55.2, 2026-10-22 | membaca `tasks.md` dari branch dan worktree aktif lain sebelum menawarkan task; Definition of Done default per project |
| ccpm | github.com/automazeio/ccpm | ~8k | commit 2026-10-19 | field `conflicts_with` di samping `scope`; `next --json --parallel` mengembalikan himpunan task yang tidak saling bentrok; sinkron GitHub Issues opsional |
| claude-task-master | github.com/eyaltoledano/claude-task-master | ~28k | 0.43.1 | `sdd deps --validate` (id hilang, siklus); tie-break deterministik di `next`: prioritas, jumlah dependen, id |
| spec-workflow-mcp | github.com/Pimzino/spec-workflow-mcp | ~4k | 2026-07, maintainer rehat | log implementasi per task (file dan baris) sebagai bahan EV |
| Conductor (Gemini CLI) | github.com/gemini-cli-extensions/conductor | ~4k | v0.4.1, 2026-03 | trailer commit `Task: T-xxx` sehingga validator dapat mencari commit EV dari trailer dan `/sdd:revert T-xxx` mungkin |
| OpenAI Symphony | github.com/openai/symphony | ~28k | 0.0.3, 2026-09-15, preview | lease klaim dengan stall timeout; `sdd reconcile` membersihkan klaim basi; state "Human Review" (= `review` kita) |
| Paperclip | github.com/paperclipai/paperclip | ~106k | v2026.1012.0 | checkout atomik: satu assignee dan execution lock; klaim kedua ditolak |

### D. Requirement dan traceability berbasis teks

| Nama | URL | Bintang | Rilis | Ide untuk template |
|---|---|---|---|---|
| Doorstop | github.com/doorstop-dev/doorstop | 687 | 3.2, 2026-07 | fingerprint parent di setiap link: simpan `ac_hash` di blok EV, tandai evidence suspect saat teks AC berubah |
| StrictDoc | github.com/strictdoc-project/strictdoc | 422 | 0.30.4, 2026-10-22 | `sdd verify` membaca JUnit XML dan menyelesaikan `[test: path#name]` menjadi pass/fail per AC |
| sphinx-needs | github.com/useblocks/sphinx-needs | 315 | 9.1.0, 2026-10-22 | aturan lint deklaratif (kardinalitas link, severity) di `sdd.config.json`, keluaran `schema_violations.json` |
| OpenFastTrace | github.com/itsallcode/openfasttrace | 201 | 4.10.0 | `needs: [impl, test, ev]` per AC; laporan ok / not ok / missing `-test` / unrequested `+itest`; exit status = hasil trace |
| LOBSTER (BMW) | github.com/bmw-software-engineering/lobster | 62 | | `trace.json` machine-readable di samping `state.yaml` |
| vale-ears | github.com/tbhb/vale-ears | 0 | | daftar weak words untuk aturan banned-vague-words di spec lint |

### E. Context engineering dan PRP

| Nama | URL | Bintang | Aktivitas | Ide untuk template |
|---|---|---|---|---|
| context-engineering-intro | github.com/coleam00/context-engineering-intro | ~14k | 2026-03 | template intake (FEATURE, EXAMPLES, DOCUMENTATION, OTHER CONSIDERATIONS) untuk `/sdd:clarify`; `examples:` di `design.md` |
| PRPs-agentic-eng | github.com/Wirasm/PRPs-agentic-eng | ~2k | 2026-10-02 | gate `--validate "<cmd>"`: exit 0 satu-satunya tanda lulus; kolom Parallel dan Depends di plan |
| 12-factor-agents | github.com/humanlayer/12-factor-agents | ~27k | 2025-09 | pemetaan F3 brief, F5 `tasks.md` sebagai state, F6 handoff, F7 assumption, F9 EV, F10 verifier, F12 `next --json` (INFERENSI peneliti) |
| claude-code-hooks-mastery | github.com/disler/claude-code-hooks-mastery | ~4k | 2026-02 | `PostToolUseFailure` mencatat check gagal; `SubagentStop` menangkap verdict verifier |
| claude-code-security-review | github.com/anthropics/claude-code-security-review | ~6k | | workflow opsional dengan instruksi scan dirender dari `rules.md`; README-nya bilang tidak tahan prompt injection, jadi hanya PR tepercaya |
| SuperClaude | github.com/SuperClaude-Org/SuperClaude_Framework | ~24k | v4.3.0 | hanya ide `confidence-check`: gate kesiapan di `/sdd:task` sebelum implementasi |

### F. Orkestrasi multi-agent pada satu repo

| Nama | URL | Bintang | Catatan | Ide untuk template |
|---|---|---|---|---|
| Claude Code agent teams | code.claude.com/docs/en/agent-teams | | eksperimental, task list di `~/.claude/tasks/` (luar repo), klaim via file lock | `TaskCompleted` hook exit 2 kecuali task di `tasks.md` punya EV id |
| claude-squad | github.com/smtg-ai/claude-squad | ~9k | AGPL, tmux + worktree per sesi, tanpa lock | dokumentasikan sebagai runner opsional saja |
| ruflo (ex claude-flow) | github.com/ruvnet/ruflo | ~79k | isolasi tidak terdokumentasi, klaim performa self-reported | tidak ada |
| Vibe Kanban | github.com/BloopAI/vibe-kanban | ~28k | sunset (bloop tutup 2026-04-10) | hindari |

## 5. Fakta resmi Claude Code 2026 yang mengubah rencana

HIGH, dari code.claude.com lewat laporan riset. Nomor versi perlu dicek ulang di changelog resmi sebelum ditulis ke docs template.

- Hooks kini 33 event; field baru `if`, `onFailure: "block"` (v2.1.295+), `shell: powershell`, `async`, handler `prompt` dan `agent` (eksperimental). Template memakai 4 event. `onFailure: "block"` membuat guard gagal tertutup; `PostToolBatch` merender sekali per batch; v2.1.309 memperbaiki hook PowerShell yang gagal terbuka, jadi minimum versi perlu didokumentasikan.
- Stop hook: `stop_hook_active` (sudah dicek), `last_assistant_message`, cap 8 blok beruntun (`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`). Stop yang memblokir (ADR-0002) kini punya batas resmi.
- `TaskCreated` dan `TaskCompleted` hook: gate "done" di level task, bukan hanya sesi.
- `/goal`: Stop hook berbasis prompt untuk satu sesi; evaluatornya tidak bisa menjalankan perintah, jadi melengkapi, bukan mengganti, Stop hook perintah.
- Subagent: `isolation: worktree` bercabang dari default branch kecuali `worktree.baseRef: "head"`; penting untuk verifier yang memeriksa kerja belum di-push. `memory: project` menulis `.claude/agent-memory/`; bertentangan dengan aturan "provider memory bukan sumber kebenaran" kecuali diberi kebijakan (gitignore atau dilarang).
- Workflows: skrip JavaScript di `.claude/workflows/` dengan `agent`, `pipeline`, `parallel`, schema; cocok untuk `/sdd:converge` dan `sdd verify` adversarial.
- Skills: commands sudah dilebur ke skills; `.claude/commands/` tetap jalan. Skill bisa menyuntik keluaran perintah dengan `` !`npm run sdd -- brief` `` dan mendukung `context: fork`, `paths`.
- AGENTS.md dibaca native sejak v2.1.277, hanya jika tidak ada CLAUDE.md; pola `@AGENTS.md` kita adalah yang didokumentasikan dan tidak membaca dua kali. Cursor, Copilot, Windsurf/Devin, Cline, Kiro membaca AGENTS.md native; Gemini CLI hanya lewat `context.fileName`.
- Cloud: sesi satu repo memuat hooks, skills, agents, CLAUDE.md; tidak memuat plugin yang di-enable repo; project thread hanya memuat CLAUDE.md root dan rules tanpa path. Fallback CLI tetap diperlukan (menguatkan ADR-0003).
- Plugin `security-guidance` membaca `.claude/claude-security-guidance.md` dan `.claude/security-patterns.json`; keduanya bisa dirender dari `rules.md`.
- Agent Skills (agentskills.io, Apache-2.0) adalah standar terbuka; Cursor dan Codex memuat `.agents/skills/`.
- Best practices resmi menyebut empat cara gate "done": prompt, `/goal`, Stop hook, verifier subagent atau workflow.

## 6. Rekomendasi

Ukuran: S (jam), M (hari), L (minggu). Prioritas: P0 sebelum rilis 2.1.0, P1 patch 2.1.x, P2 minor 2.2, P3 setelahnya.

### 6.1 Fitur baru yang harus ditambahkan

| # | Apa | Alasan dan bukti | Sumber ide | Ukuran | Prio |
|---|---|---|---|---|---|
| N1 | `sdd upgrade --infer-answers`: susun `answers` dari `sdd.config.json`, git config, dan `product.md`; tanya hanya yang hilang | 10 project tanpa `template` record (bagian 3) | copier | S | P1 |
| N2 | Migrasi evidence legacy di `sdd upgrade`: EV lebih tua dari tanggal upgrade diberi `legacy: true`, pelanggaran trust pada EV legacy jadi warning | 5 sampai 206 error per project saat divalidasi 2.1 | cruft, spec-kit upgrade | S | P1 |
| N3 | EV terstruktur: `kind`, `commands` (daftar), `commit: <repo>@<sha>`, `commit: pending` selama task belum done, `captured`, `exit_code` | kelas error dominan (bagian 3a) | ADR-0002, StrictDoc | M | P2 |
| N4 | `sdd verify T-xxx [--validate "<cmd>"]`: jalankan perintah `tech.md` (atau perintah yang diberikan), tulis blok EV dengan output, exit code, `git rev-parse HEAD`, `captured: true`; exit 0 satu-satunya tanda lulus | agent berhenti mengetik evidence; ADR-0002 phase 3 | PRP, ADR-0002 | M | P2 |
| N5 | `ac_hash` di EV dan status `suspect` di validator saat teks AC berubah setelah EV ditulis | evidence basi tidak terdeteksi hari ini | Doorstop | S | P2 |
| N6 | Klaim task: `claimed_by`, `claimed_at`, `lease_until` di blok T; `sdd claim` atomik (tolak klaim kedua); `sdd reconcile` membersihkan lease basi; `next` membaca `tasks.md` dari worktree aktif lain | loopday dan trivia sudah memakai worktree paralel | beads, Symphony, Paperclip, Backlog.md | M | P2 |
| N7 | `conflicts_with` di blok T dan `sdd next --parallel` yang mengembalikan himpunan task bebas bentrok, dengan tie-break deterministik | `scope` saja tidak menangkap konflik logis | ccpm, task-master | S | P2 |
| N8 | Trailer commit `Task: T-xxx` (disarankan di `workflow.md`, dicek validator untuk commit EV) | mencari commit EV lewat pesan commit, bukan hash yang sering salah ketik | Conductor | S | P2 |
| N9 | `TRACE.md` dan `trace.json` dirender: FR x AC x T x EV x status test (ok, not ok, missing, suspect) | matriks ini yang dibaca reviewer dan calon pengguna | OpenFastTrace, sphinx-needs, LOBSTER | M | P2 |
| N10 | Gate level git: `.githooks/pre-commit` (dipasang `init` lewat `core.hooksPath`) menjalankan `sdd render --check`, `sdd guard --check`, dan `sdd validate` | render stale di ui8-starter; tool tanpa hook | setup-pre-commit, lefthook | S | P1 |
| N11 | `permissions.deny` di `.claude/settings.json` dirender dari pola secret dan path generated/frozen (`Read(.env*)`, `Edit(AGENTS.md)`, ...) | lapisan kedua di samping hook, nol biaya runtime | lnai | S | P1 |
| N12 | `TaskCompleted` hook: exit 2 jika task yang ditutup tidak punya EV id di `tasks.md`; Stop hook yang memblokir sesuai ADR-0002 dengan cap resmi | gate "done" per task | docs Claude Code, agent teams | M | P2 |
| N13 | Verifier subagent `.claude/agents/sdd-verifier.md` (read-only, `isolation: worktree`, `worktree.baseRef: head`) yang menulis `reviewed_by`; `SubagentStop` menangkap verdict | ADR-0002 phase 3 | docs Claude Code, hooks-mastery | M | P3 |
| N14 | `/sdd:clarify` dengan template intake (FEATURE, EXAMPLES, DOCUMENTATION, OTHER CONSIDERATIONS) dan penutupan batch assumption; brief hanya memuat assumption feature aktif | trivia-app 66 assumption open | PRP, ADR-0002 | M | P2 |
| N15 | Spec lint deklaratif di `sdd.config.json` (setiap FR punya AC; AC Given/When/Then, EARS, atau terukur; weak words dari vale-ears) | ADR-0002 phase 5 | sphinx-needs, vale-ears | M | P3 |
| N16 | `sdd deps --validate` (id hilang, siklus, `depends_on` lintas feature) | 370 task tanpa pemeriksaan siklus | task-master | S | P2 |

### 6.2 Upgrade fitur yang sudah ada

| # | Apa | Alasan | Ukuran | Prio |
|---|---|---|---|---|
| U1 | `onFailure: "block"` pada hook PreToolUse; dokumentasikan versi minimum Claude Code (>= 2.1.309, cek ulang) | guard gagal tertutup | S | P0 |
| U2 | `PostToolBatch` menggantikan atau melengkapi PostToolUse untuk render | render sekali per batch, bukan per edit | S | P1 |
| U3 | `.gitignore` template dan preset: `.claude/worktrees/`, `.claude/agent-memory/`; kebijakan `memory: project` di `rules.md` | fitur 2026 menulis ke repo | S | P0 |
| U4 | `.claude/agents/`, `.claude/skills/`, `.claude/launch.json` dinyatakan milik project: tidak managed, tidak dihapus upgrade, diimpor `sdd adopt` | 3 project sudah memilikinya | S | P1 |
| U5 | Preset app menulis `.claude/launch.json` default (dev server per preset) | 7 project membuatnya sendiri | S | P2 |
| U6 | `sdd adopt` mengimpor CLAUDE.md, `.cursorrules`, copilot-instructions yang sudah ada ke steering | brownfield nyata punya rule lama | M | P2 |
| U7 | `adapters:sync`: target `.agents/skills/sdd-*` (Agent Skills standar; dibaca Cursor dan Codex) di samping `.claude/commands/`; `revert`/`clean` per tool; blok `.gitignore` terkelola opsional | standar lintas tool, opt-out bersih | M | P2 |
| U8 | `/sdd:task` menyuntik `` !`npm run sdd -- brief` `` dan menambah `confidence-check` sebelum implementasi | brief selalu segar di sesi tanpa hook | S | P2 |
| U9 | `/sdd:converge` dan `sdd verify` sebagai workflow `.claude/workflows/` (pipeline review lalu verify per AC) | adversarial, konteks bersih | M | P3 |
| U10 | `sdd next`: tie-break deterministik (prioritas, dependen, id); `sdd status --json` untuk routine | routine butuh keluaran stabil | S | P2 |
| U11 | Render `.claude/claude-security-guidance.md` dan `security-patterns.json` dari `rules.md`; workflow `security-review` opsional untuk PR tepercaya | pakai plugin resmi, bukan tulis ulang | S | P3 |
| U12 | Definition of Done default per project dipakai `sdd verify` dan `/sdd:review` (bukan hanya dokumen) | `docs/quality/definition-of-done.md` belum dieksekusi | S | P2 |
| U13 | `claude plugin validate --strict` dan `claude plugin eval` di CI untuk `.claude/commands/` | perintah diuji, bukan hanya skrip | M | P3 |

### 6.3 Expand: supaya dipakai orang lain

| # | Apa | Alasan | Sumber | Ukuran | Prio |
|---|---|---|---|---|---|
| E1 | Rilis 2.1.0 lewat release-please, tag, GitHub Release dengan catatan upgrade | tanpa tag, `sdd upgrade` tidak punya basis | ADR-0003 | S | P0 |
| E2 | Publish `@vxerys/sdd` ke npm (trusted publishing sudah disiapkan) dan paket `create-sdd` (`npm create sdd`) yang mengambil template lewat giget lalu menjalankan `init`; nama paket perlu dicek ketersediaannya (UNVERIFIED) | satu perintah menggantikan "Use this template, clone, install, init"; upgrade tanpa checkout lokal | spec-kit, giget, npm | M | P1 |
| E3 | `.claude-plugin/marketplace.json` satu plugin (commands, rules, agents) sebagai discovery; bukan jalur distribusi (ADR-0003) | `marketplace add --scope project` dan `claude plugin validate --strict` | docs plugins | S | P2 |
| E4 | Docs site dari `docs/` (GitHub Pages; Starlight atau mkdocs) dengan halaman "Why", "vs spec-kit / OpenSpec / BMAD", quick start, konsep | README 158 baris terlalu padat untuk orang baru | spec-kit | M | P2 |
| E5 | `README.id.md`, dan `--lang` yang juga memilih bahasa guidance prose di template (bukan hanya konten) | pengguna Indonesia; spec-kit punya ja/ko/zh | spec-kit | S | P2 |
| E6 | Demo: GIF `init` sampai `/sdd:task` (rekam terminal), dan contoh kedua `examples/flutter-supabase` (ADR-0002) | orang menilai dari 30 detik pertama | claude-code-templates | M | P2 |
| E7 | Hygiene komunitas: issue templates (bug, preset request, feature), CODE_OF_CONDUCT, SUPPORT, Discussions, CITATION.cff, devcontainer | syarat awesome-claude-code dan kontribusi preset | spec-kit | S | P1 |
| E8 | Katalog preset komunitas: preset app/db sebagai folder yang bisa dikontribusikan, dengan schema test yang sudah ada | permintaan pertama dari orang lain hampir pasti "preset untuk X" | spec-kit | S | P2 |
| E9 | `sdd stats --json` lokal (task, EV, assumption, waktu planned ke done) tanpa telemetri | bahan evaluasi, termasuk untuk skripsi kandidat "SDD dengan AI assistant" | | S | P3 |
| E10 | Submit ke awesome-claude-code dan skills.sh setelah publish dan 14 hari riwayat | syarat mereka | awesome-claude-code | S | P3 |

### 6.4 Urutan yang disarankan

1. **2.1.0 (minggu ini):** E1 rilis; U1, U3 masuk sebelum tag karena menyentuh gate.
2. **2.1.x patch:** N1, N2, N10, N11, U2, U4, E7. Lalu pilot `sdd upgrade` pada loopday-app (feature paling lengkap, 59 EV) dan mangcoding-ui8-starter (kosong); catat setiap error migrasi sebagai test.
3. **2.2:** N3, N4, N5, N6, N7, N8, N9, N12, N14, N16, U5, U6, U7, U8, U10, U12, E2, E3, E4, E5, E6, E8. Ini rilis "dipakai orang lain".
4. **2.3 / 3.0:** N13, N15, U9, U11, U13, E9, E10, ekstraksi `@vxerys/sdd` jika maintainer kedua muncul (ADR-0003).

## 7. Tidak disarankan

- Mengganti `adapters:sync` dengan ruler atau rulesync (tidak paham frozen path dan validasi render).
- Memakai kode dari Task Master (Commons Clause), spec-workflow-mcp dan OpenFastTrace (GPL-3.0), LOBSTER (AGPL-3.0), claude-squad (AGPL-3.0): ambil ide saja.
- Dolt atau database sebagai penyimpanan task (beads): bertentangan dengan markdown-in-git sebagai sumber kebenaran.
- Agent teams sebagai default (eksperimental, task list di luar repo); Vibe Kanban (sunset); ruflo (klaim tidak terverifikasi); SuperClaude penuh (konteks besar).
- Symlink CLAUDE.md ke AGENTS.md (rusak di Windows tanpa `core.symlinks`); target Roo (tutup 2026-05-15, MEDIUM); steipete/agent-rules (diarsipkan 2026-05-03).
- Plugin sebagai satu-satunya distribusi (cloud tidak memuatnya; ADR-0003).

## 8. Gap riset

- Nomor versi Claude Code (2.1.277, 2.1.295, 2.1.309) dan daftar 33 hook event berasal dari laporan riset; cek ulang di changelog resmi sebelum masuk docs.
- Tahun rilis ruler, block/ai-rules, lnai, beads, claude-squad, SuperClaude tidak tampil di GitHub.
- Ketersediaan nama `create-sdd` dan `@vxerys/sdd` di npm: UNVERIFIED.
- Apakah Claude Code membaca `.agents/skills/`; cara Copilot menggabung AGENTS.md dan `copilot-instructions.md`: UNVERIFIED.
- Format hook Cursor, Codex, Gemini, Copilot, Kiro untuk shim (ADR-0002 phase 4) belum diriset.
- earsyntax (linter EARS) tidak bisa dibuka.
- Repo benchmark kemarin hanya spec-kit yang dicek ulang (1.2.3); OpenSpec, BMAD, cc-sdd, agent-os, superpowers tidak.
- Inferensi bagian 3 (jawaban init bisa disimpulkan; EV legacy jadi warning) belum diuji pada project nyata.

## 9. Keputusan owner

Dijawab 2026-10-23 dan dicatat di ADR-0004: dogfood dulu; rilis 2.1.0 segera; evidence tetap ketat dengan EV terstruktur, `sdd verify`, dan EV legacy; klaim lease file dengan trailer `Task:`; cap lite 120 dengan error di atas 200; pilot pada mangcoding-ui8-starter lalu loopday-app; `sdd stats` dan `CITATION.cff` di P2; fase expand dibuka saat 10 project lolos `sdd validate` non-strict.

## 10. Hasil pilot (2026-10-24, VERIFIED)

Rilis: v2.1.0 (2026-10-23), v2.1.1 (2026-10-24, inferensi answers dan migrasi EV legacy), v2.1.2 (perbaikan dari pilot). Semua lewat release-please setelah owner mengaktifkan izin "Allow GitHub Actions to create and approve pull requests".

| Pilot | 2.0.0 → 2.1.1 | Konflik | Validator 2.1.1 (milik project) | Validator 2.1.2, non-strict | Validator 2.1.2, strict |
|---|---|---|---|---|---|
| mangcoding-ui8-starter (0 feature) | 43 update, 15 add, 1 merge | `context-integrity.yml`, `package.json` | 1 error (`A-001 feature: none`) | 0 / 0 / 0 | 0 error |
| loopday-app (8 feature, 44 task, 59 EV) | 43 update, 15 add, 1 merge, 59 EV dicap `legacy` | sama | 5 error, 104 info | 0 error, 8 warning (cap lite), 108 info | 8 error (cap lite) |

Bug dan celah template yang ditemukan pilot, dengan perbaikannya:

1. `init` 2.0.0 menolak `--date`, jadi rebuild base gagal untuk semua project pra-2.1 → 2.1.1: hanya flag yang tercantum di usage `init` versi target yang dikirim (`initArgs`).
2. Project pra-2.1 tidak punya skrip `sdd` → README: upgrade pertama memakai CLI template dari direktori project.
3. Konvensi `feature: none` untuk assumption lintas-project dipakai semua project turunan dan ditolak validator 2.1 → 2.1.2: `none` diterima; yang masih `open` jadi warning; brief menampilkannya sebagai project-wide.
4. Task `done` yang seluruh evidence-nya legacy dan tidak menutup AC dari FR-nya (4 di loopday) → 2.1.2: `info`, bukan error.
5. `.gitignore` tidak managed, jadi entri Claude Code 2.1 tidak sampai ke project → migrasi 2.1.2 menambahkannya bila belum ada.
6. Test e2e "project pra-2.1" meng-init dari template versi sekarang sehingga migrasi 2.1.1 benar tidak jalan → skenario test memberi label versi basis 2.0.0.
7. Dua konflik yang sama di setiap project pra-2.1: `context-integrity.yml` (CI 2.0.0 rusak lalu ditulis ulang owner) dan `package.json` (deskripsi dan skrip tambahan). Delapan project sisanya akan menghasilkan konflik yang sama; kandidat 2.2: merge `package.json` secara struktural (gabungkan `scripts`) dan tandai workflow CI sebagai milik project setelah diedit.

Upgrade kedua, 2.1.1 → 2.1.2, lewat CLI milik project (`npm run sdd -- check`, `status`, `upgrade`): 3 update, 1 add, 1 merge, 0 konflik di kedua pilot; `sdd status` menampilkan tepat tiga managed file yang diedit tangan. Setelahnya kedua pilot lolos `context:validate --strict` dengan 0 error dan 0 warning (loopday: 108 info legacy). Branch `chore/sdd-upgrade-2.1` di kedua project berisi dua commit upgrade, belum di-push.

Temuan tambahan: owner sudah mem-patch validator di ui8-starter (diwarisi loopday) dengan cap tersendiri untuk `verification.md` (`limits.verification`, komentar "Verification grows by one evidence block per task"). Patch itu selamat lewat dua kali 3-way merge, dan itulah sebabnya 8 warning cap lite hilang di loopday. Patch ini adalah jawaban nyata untuk pertanyaan cap di bawah dan layak diangkat ke template di 2.2.

### Rollout delapan project sisanya (2026-10-24, VERIFIED)

Semua lewat `node <template>/scripts/sdd/cli.mjs upgrade --from <template> --to v2.1.2` dari direktori project, di branch lokal `chore/sdd-upgrade-2.1`, tanpa push. Konflik `package.json` diselesaikan dengan satu skrip (skrip project dipertahankan, `engines`, `bin`, `sdd`, dan deskripsi dari template; identitas dari template hanya bila project masih membawa nama starter), konflik workflow CI dengan skrip kedua (langkah project dipertahankan, Guard check dari template).

| Project | Basis | `sdd validate` | Strict | Catatan |
|---|---|---|---|---|
| bookmate-web | main | 0 error, 8 warning, 39 info | 8 error | A-001 sampai A-007 punya baris `feature:` kosong, diisi `none`; satu `verification.md` 201 baris di atas cap full 200 |
| inzta-investor-portal | main | 0 error, 2 warning, 30 info | 2 error | CI 2.0.0 tidak pernah diedit, jadi workflow baru masuk tanpa konflik; `package.json` 3 hunk |
| trivia-app | main | 0 error, 2 warning, 198 info | 2 error | `package.json` masih bernama `mangcoding-ui8-starter`, identitas diambil dari template; patch validator owner ikut ter-merge |
| sechan-portfolio | main | 0 error, 5 warning, 49 info | 5 error | handoff kedaluwarsa plus cap; `-f011` dan `-marquee` adalah worktree repo yang sama, menerima upgrade lewat `main` |
| fluxa-web | main | 0 error, 2 warning | 2 error | `docs/design/` untracked di-stash lalu dikembalikan; A-001 dan A-002 tanpa baris `feature:` sama sekali, ditambah `none`; worktree dikembalikan ke `feat/F-003-T-001-spec` |
| interior-serang-web | dilewati | | | 0 commit, 19 file untracked: tidak ada basis branch; perlu commit awal dari owner |

Sepuluh project turunan: sembilan di 2.1.2 dengan 0 error non-strict (kriteria Q10(a) terpenuhi), satu menunggu commit awal. Strict masih merah di tujuh project karena warning (cap, assumption open project-wide, handoff kedaluwarsa).

Kandidat 2.1.3 dari rollout:

1. Pemeriksaan tree kotor mengabaikan file untracked di luar managed path (fluxa-web).
2. Migrasi: assumption tanpa baris `feature:` mendapat `feature: none` (9 entri di dua project).
3. Merge `package.json` secara struktural: gabungkan `scripts`, ambil identitas template hanya bila nama masih nama starter (kedua skrip resolusi di sesi ini adalah prototipenya).
4. Workflow CI yang sudah ditulis ulang owner: pertahankan langkah project, tambahkan Guard check, atau tulis versi template sebagai `.rej`.

Yang belum selesai dan menunggu keputusan 2.2:

- Cap lite: `verification.md` loopday 101 sampai 250 baris karena evidence bertambah terus (append-only). Keputusan Q6(a) (120 warning, 200 error) tetap membuat F-001 (250 baris) error dan CI strict merah. Usulan: angkat patch owner (`limits.verification`, cap tersendiri untuk verification) ke template, bersama cap lite 120. INFERENSI dari data pilot, bukan keputusan.
- `AGENTS.md` kedua pilot 176 sampai 179 baris (cap 150, warning sync): steering project panjang; perlu panduan memangkas atau cap yang realistis.
- Validator di derived CI berjalan `--strict`, sehingga warning apa pun (cap, assumption open project-wide) memerahkan CI meski `sdd validate` non-strict hijau. Kriteria Q10(a) terpenuhi untuk kedua pilot pada validator 2.1.2; CI strict belum.
