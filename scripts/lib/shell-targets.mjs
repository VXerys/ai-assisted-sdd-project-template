// Best-effort extraction of the paths a Bash or PowerShell command writes or reads.
// It is a tripwire for the PreToolUse guard, not a shell parser: obfuscated commands get through,
// which is why `npm run guard:check` in CI re-checks the diff itself.

const OPERATORS = ['&&', '||', '>>', '2>>', '&>', '2>', '1>', '>', '|', ';', '&', '<', '\n'];
const REDIRECTS = new Set(['>', '>>', '1>', '2>', '2>>', '&>']);
const SEPARATORS = new Set(['&&', '||', '|', ';', '&', '\n']);

// Commands (lowercase, Bash and PowerShell aliases alike) whose every path argument is changed.
const WRITE_ALL = new Set([
  'rm', 'rmdir', 'rd', 'touch', 'truncate', 'mv', 'move', 'ln', 'unlink', 'shred', 'tee', 'del', 'erase', 'ren', 'rename',
  'remove-item', 'ri', 'new-item', 'ni', 'rename-item', 'rni', 'move-item', 'mi', 'clear-content'
]);
// Copy commands: only the destination (-Destination, else the last path argument) is changed.
const COPY = new Set(['cp', 'copy', 'install', 'rsync', 'xcopy', 'robocopy', 'copy-item', 'cpi']);
// Commands that edit their file arguments in place only with -i / --in-place.
const IN_PLACE = new Set(['sed', 'perl', 'ruby']);
// PowerShell cmdlets whose -Value-style parameters carry content, not paths.
const PS_CONTENT = new Set(['set-content', 'sc', 'add-content', 'ac', 'out-file', 'export-csv', 'set-itemproperty']);
const PS_PATH_PARAMS = new Set(['-path', '-literalpath', '-filepath', '-destination', '-newname']);
// Switch parameters take no value, so the word after them is still a positional.
const PS_SWITCHES = new Set(['-recurse', '-force', '-append', '-nonewline', '-noclobber', '-passthru', '-whatif', '-confirm', '-verbose', '-raw', '-container']);
// Printing a name is not reading the file it names.
const ECHO = new Set(['echo', 'printf', 'write-output', 'write-host', 'git']);
const WRITE_API = /(writeFileSync|appendFileSync|writeFile|appendFile|createWriteStream|rmSync|unlinkSync|renameSync|copyFileSync|WriteAllText|WriteAllLines|AppendAllText|write_text|write_bytes|open\s*\([^)]*['"][wa]\+?['"])/;
const INLINE_CODE = /(?:^|\s)(?:node|python3?|ruby|perl|pwsh|powershell)(?:\.exe)?\s+(?:-e|-c|--eval|-Command)\s/i;

export function tokenize(command) {
  const tokens = [];
  let current = '';
  let quote = null;
  let quoted = false;
  const push = () => {
    if (current || quoted) tokens.push({ value: current, quoted });
    current = '';
    quoted = false;
  };
  for (let index = 0; index < command.length; index += 1) {
    const char = command[index];
    if (quote) {
      if (char === quote) quote = null;
      else if (char === '\\' && quote === '"' && command[index + 1] === '"') current += command[++index];
      else current += char;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      quoted = true;
      continue;
    }
    const operator = OPERATORS.find((op) => command.startsWith(op, index) && !(op === '&' && command[index + 1] === '>'));
    if (operator && !(operator.match(/^[12]/) && current)) {
      push();
      tokens.push({ value: operator, operator: true });
      index += operator.length - 1;
      continue;
    }
    if (/\s/.test(char)) {
      push();
      continue;
    }
    current += char;
  }
  push();
  return tokens;
}

function segments(tokens) {
  const result = [];
  let words = [];
  let redirects = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.operator && REDIRECTS.has(token.value)) {
      const target = tokens[index + 1];
      if (target && !target.operator) redirects.push(target.value);
      index += 1;
    } else if (token.operator && token.value === '<') {
      index += 1;
    } else if (token.operator && SEPARATORS.has(token.value)) {
      result.push({ words, redirects });
      words = [];
      redirects = [];
    } else if (!token.operator) {
      words.push(token.value);
    }
  }
  result.push({ words, redirects });
  return result.filter((segment) => segment.words.length || segment.redirects.length);
}

const isFlag = (word) => /^-/.test(word) && word !== '-';

function commandName(words) {
  let index = 0;
  while (index < words.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index]) || ['sudo', 'command', 'env', 'xargs', '&', '.'].includes(words[index]))) index += 1;
  return { name: (words[index] ?? '').replace(/^.*[\\/]/, '').replace(/\.exe$/i, ''), args: words.slice(index + 1) };
}

// Splits arguments into named path parameters and positionals; a PowerShell parameter's value is
// never a positional (`-Value 'text'`), while a Bash flag is assumed to take no value.
function pathArguments(args, powershellStyle) {
  const named = {};
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const word = args[index];
    if (!isFlag(word)) {
      positional.push(word);
      continue;
    }
    const name = word.toLowerCase().replace(/:.*$/, '');
    const next = args[index + 1];
    if (PS_PATH_PARAMS.has(name) && next !== undefined) named[name] = next;
    if (powershellStyle && !PS_SWITCHES.has(name) && next !== undefined && !isFlag(next)) index += 1;
  }
  return { named, positional };
}

// Returns {writes, reads, cwdChanges}: raw path strings as written in the command, plus `cd` targets in order.
export function shellTargets(command) {
  const text = String(command ?? '');
  let dir = null;
  const writes = [];
  const reads = [];
  const at = (target) => (dir && !isAbsolute(target) ? `${dir}/${target}` : target);
  const write = (...targets) => writes.push(...targets.map(at));

  for (const { words, redirects } of segments(tokenize(text))) {
    write(...redirects);
    if (!words.length) continue;
    const { name, args } = commandName(words);
    const lower = name.toLowerCase();
    if (CD.has(lower)) {
      const target = args.find((word) => !isFlag(word));
      if (target) dir = at(target);
      continue;
    }
    const powershellStyle = lower.includes('-') || PS_CONTENT.has(lower) || args.some((word) => PS_PATH_PARAMS.has(word.toLowerCase()));
    const { named, positional } = pathArguments(args, powershellStyle);
    const namedPaths = Object.values(named);

    if (WRITE_ALL.has(lower)) write(...positional, ...namedPaths);
    else if (COPY.has(lower)) {
      const destination = named['-destination'] ?? (positional.length > 1 ? positional.at(-1) : null);
      if (destination) write(destination);
    } else if (IN_PLACE.has(lower) && args.some((word) => /^(-i|--in-place|-pi)/.test(word))) write(...positional);
    else if (PS_CONTENT.has(lower)) write(...(namedPaths.length ? namedPaths : positional.slice(0, 1)));

    if (!ECHO.has(lower)) reads.push(...[...positional, ...namedPaths].map(at));
  }

  // Inline scripts (`node -e "fs.writeFileSync('x')"`): any quoted literal next to a write API counts as a write.
  if (INLINE_CODE.test(text) && WRITE_API.test(text)) {
    for (const match of text.matchAll(/(['"`])([^'"`\s]+?)\1/g)) write(match[2]);
  }
  return { writes: unique(writes), reads: unique(reads) };
}

const CD = new Set(['cd', 'set-location', 'sl', 'pushd', 'chdir']);

function isAbsolute(target) {
  return /^([A-Za-z]:)?[\\/]|^~|^\$/.test(target);
}

function unique(values) {
  return [...new Set(values.filter((value) => value && value !== '-' && !/^\/dev\/|^\$null$|^NUL$/i.test(value)))];
}
