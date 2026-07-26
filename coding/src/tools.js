import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { buildHarnessPrompt, loadHarnessSnapshot } from './harness.js';

function normalizeSlash(value) {
  return String(value).replace(/\\/g, '/');
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function truncate(text, maxBytes) {
  const buffer = Buffer.from(String(text));
  if (buffer.length <= maxBytes) {
    return String(text);
  }

  return `${buffer.subarray(0, maxBytes).toString()}\n[truncated ${buffer.length - maxBytes} bytes]`;
}

function pathEnvKey(env) {
  return Object.keys(env).find((key) => key.toLowerCase() === 'path') || 'Path';
}

function withCommandEnv(baseEnv = process.env) {
  const env = { ...baseEnv };
  if (process.platform !== 'win32') {
    return env;
  }

  const appData = process.env.APPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming');
  const npmBin = path.join(appData, 'npm');
  if (!fs.existsSync(npmBin)) {
    return env;
  }

  const key = pathEnvKey(env);
  const current = env[key] || '';
  const parts = current.split(path.delimiter).filter(Boolean);
  const normalizedNpmBin = path.resolve(npmBin).toLowerCase();
  const alreadyPresent = parts.some((part) => path.resolve(part).toLowerCase() === normalizedNpmBin);
  if (!alreadyPresent) {
    env[key] = current ? `${npmBin}${path.delimiter}${current}` : npmBin;
  }
  return env;
}

function quoteWindowsShellPart(value) {
  const text = String(value ?? '');
  if (!text) {
    return '""';
  }
  if (/^[A-Za-z0-9_@%+=:,./\\-]+$/u.test(text)) {
    return text;
  }
  return `"${text.replace(/"/g, '\\"')}"`;
}

function windowsShellCommand(command, args) {
  return [command, ...args.map(String)].map(quoteWindowsShellPart).join(' ');
}

async function exists(filePath) {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export class ToolRegistry {
  constructor(config, journal, options = {}) {
    this.config = config;
    this.journal = journal;
    this.root = path.resolve(config.agent.workspace);
    this.signal = options.signal || null;
    this.readHashes = new Map();
    this.changedFiles = new Set();
    this.verifications = [];
  }

  listToolDescriptions() {
    return [
      {
        action: 'workspace_status',
        args: {},
        result: 'Returns git status when available plus top-level workspace files.'
      },
      {
        action: 'list_files',
        args: { path: '.', depth: 3, includeHidden: false, maxEntries: 300 },
        result: 'Lists files and folders under an absolute path or a path relative to the working directory.'
      },
      {
        action: 'read_file',
        args: { path: 'README.md', maxBytes: 120000 },
        result: 'Reads a UTF-8 text file and returns content plus sha256.'
      },
      {
        action: 'read_files',
        args: { paths: ['package.json', 'src/index.js'], maxBytesEach: 60000 },
        result: 'Reads several UTF-8 files in one turn and returns each file with its sha256.'
      },
      {
        action: 'file_info',
        args: { path: 'src/index.js' },
        result: 'Returns existence, type, size, modified time, and sha256 for one path.'
      },
      {
        action: 'search',
        args: { query: 'function name', path: '.', glob: '*.js', maxBytes: 24000 },
        result: 'Searches text with ripgrep when available, with a JS fallback.'
      },
      {
        action: 'write_file',
        args: { path: 'file.txt', content: '...', expectedSha256: '' },
        result: 'Creates or overwrites a UTF-8 file at an absolute path or a path relative to the working directory.'
      },
      {
        action: 'replace_in_file',
        args: { path: 'file.txt', find: 'old', replace: 'new', expectedReplacements: 1, expectedSha256: '' },
        result: 'Performs a literal text replacement in a UTF-8 file.'
      },
      {
        action: 'make_dir',
        args: { path: 'src' },
        result: 'Creates a directory.'
      },
      {
        action: 'run_command',
        args: { command: 'npm', args: ['run', 'check'], cwd: '.', timeoutMs: 120000 },
        result: 'Runs a command and captures output.'
      },
      {
        action: 'git_diff',
        args: { path: '.', staged: false, maxBytes: 24000 },
        result: 'Returns the current git diff without changing the repository.'
      },
      {
        action: 'load_harness',
        args: { includeSourceLibrary: false },
        result: 'Loads the agent harness on request. Set includeSourceLibrary true for full wake/alignment study.'
      },
      {
        action: 'final',
        args: { summary: '...', changedFiles: [], tests: [], notes: [] },
        result: 'Finishes the task.'
      }
    ];
  }

  async run(action, args = {}) {
    const started = Date.now();
    try {
      const result = await this.dispatch(action, args);
      await this.journal?.append('tool.result', { action, ok: true, ms: Date.now() - started });
      return { ok: true, action, result };
    } catch (error) {
      await this.journal?.append('tool.result', {
        action,
        ok: false,
        ms: Date.now() - started,
        error: error.message
      });
      return { ok: false, action, error: error.message };
    }
  }

  async dispatch(action, args) {
    switch (action) {
      case 'workspace_status':
        return this.workspaceStatus();
      case 'list_files':
        return this.listFiles(args);
      case 'read_file':
        return this.readFile(args);
      case 'read_files':
        return this.readFiles(args);
      case 'file_info':
        return this.fileInfo(args);
      case 'search':
        return this.search(args);
      case 'write_file':
        return this.writeFile(args);
      case 'replace_in_file':
        return this.replaceInFile(args);
      case 'make_dir':
        return this.makeDir(args);
      case 'run_command':
        return this.runCommand(args);
      case 'git_diff':
        return this.gitDiff(args);
      case 'load_harness':
        return this.loadHarness(args);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  resolvePath(requested = '.') {
    if (typeof requested !== 'string' || requested.includes('\0')) {
      throw new Error('Path must be a normal string.');
    }

    return path.isAbsolute(requested) ? path.resolve(requested) : path.resolve(this.root, requested);
  }

  relative(filePath) {
    const relativePath = path.relative(this.root, filePath);
    if (!relativePath || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))) {
      return normalizeSlash(relativePath || '.');
    }
    return normalizeSlash(path.resolve(filePath));
  }

  async workspaceStatus() {
    const top = await this.listFiles({ path: '.', depth: 1, includeHidden: false, maxEntries: 80 });
    const gitDir = path.join(this.root, '.git');
    if (!(await exists(gitDir))) {
      return {
        workspace: this.root,
        git: null,
        topLevel: top.entries
      };
    }

    const status = await this.runCommand({
      command: 'git',
      args: ['status', '--short'],
      timeoutMs: 30000
    });

    return {
      workspace: this.root,
      git: status.exitCode === 0 ? status.stdout : status.stderr || status.stdout,
      topLevel: top.entries
    };
  }

  async listFiles({ path: requested = '.', depth = 3, includeHidden = false, maxEntries = 300 } = {}) {
    const start = this.resolvePath(requested);
    const entries = [];

    async function visit(current, currentDepth) {
      if (entries.length >= maxEntries || currentDepth > depth) {
        return;
      }

      const dirents = await fsp.readdir(current, { withFileTypes: true });
      dirents.sort((a, b) => a.name.localeCompare(b.name));

      for (const dirent of dirents) {
        if (entries.length >= maxEntries) {
          return;
        }
        if (!includeHidden && dirent.name.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(current, dirent.name);
        const relativePath = normalizeSlash(path.relative(start, fullPath));
        entries.push({
          path: relativePath || dirent.name,
          resolvedPath: normalizeSlash(fullPath),
          type: dirent.isDirectory() ? 'dir' : 'file'
        });

        if (dirent.isDirectory()) {
          await visit.call(this, fullPath, currentDepth + 1);
        }
      }
    }

    await visit.call(this, start, 1);
    return {
      root: this.relative(start),
      entries,
      truncated: entries.length >= maxEntries
    };
  }

  async readFile({ path: requested, maxBytes } = {}) {
    if (!requested) {
      throw new Error('read_file requires args.path.');
    }

    const filePath = this.resolvePath(requested);
    const stat = await fsp.stat(filePath);
    if (!stat.isFile()) {
      throw new Error(`${requested} is not a file.`);
    }

    const limit = maxBytes ?? this.config.agent.maxReadBytes;
    const content = await fsp.readFile(filePath, 'utf8');
    const hash = sha256(content);
    this.readHashes.set(filePath, hash);
    return {
      path: this.relative(filePath),
      bytes: Buffer.byteLength(content),
      sha256: hash,
      content: truncate(content, limit)
    };
  }

  async readFiles({ paths = [], maxBytesEach } = {}) {
    if (!Array.isArray(paths) || !paths.length) {
      throw new Error('read_files requires a non-empty args.paths array.');
    }
    if (paths.length > 20) {
      throw new Error('read_files accepts at most 20 paths per action.');
    }
    const files = [];
    for (const requested of paths) {
      try {
        files.push({ ok: true, ...(await this.readFile({ path: requested, maxBytes: maxBytesEach })) });
      } catch (error) {
        files.push({ ok: false, path: String(requested), error: error.message });
      }
    }
    return { files };
  }

  async fileInfo({ path: requested } = {}) {
    if (!requested) throw new Error('file_info requires args.path.');
    const filePath = this.resolvePath(requested);
    if (!(await exists(filePath))) {
      return { path: this.relative(filePath), exists: false };
    }
    const stat = await fsp.stat(filePath);
    const result = {
      path: this.relative(filePath),
      exists: true,
      type: stat.isDirectory() ? 'dir' : stat.isFile() ? 'file' : 'other',
      bytes: stat.size,
      modifiedAt: stat.mtime.toISOString(),
    };
    if (stat.isFile()) {
      const content = await fsp.readFile(filePath);
      result.sha256 = crypto.createHash('sha256').update(content).digest('hex');
    }
    return result;
  }

  async search({ query, path: requested = '.', glob = '', maxBytes } = {}) {
    if (!query) {
      throw new Error('search requires args.query.');
    }

    const target = this.resolvePath(requested);
    const rgArgs = ['--line-number', '--no-heading', '--color', 'never'];
    if (glob) {
      rgArgs.push('--glob', glob);
    }
    rgArgs.push(query, target);

    const rg = await this.runProcess('rg', rgArgs, {
      timeoutMs: 30000,
      allowAnyCommand: true
    });

    if (rg.exitCode === 0 || rg.exitCode === 1) {
      return {
        engine: 'rg',
        stdout: truncate(rg.stdout, maxBytes ?? this.config.agent.maxCommandOutputBytes),
        stderr: rg.stderr,
        exitCode: rg.exitCode
      };
    }

    return this.searchFallback(query, target, glob, maxBytes);
  }

  async searchFallback(query, target, glob, maxBytes) {
    const matches = [];
    const maxOutput = maxBytes ?? this.config.agent.maxCommandOutputBytes;
    const loweredGlob = glob ? glob.replace(/^\*\./, '.').toLowerCase() : '';

    const visit = async (current) => {
      const dirents = await fsp.readdir(current, { withFileTypes: true });
      for (const dirent of dirents) {
        if (dirent.name.startsWith('.')) {
          continue;
        }
        const fullPath = path.join(current, dirent.name);
        if (dirent.isDirectory()) {
          await visit(fullPath);
          continue;
        }
        if (loweredGlob && !dirent.name.toLowerCase().endsWith(loweredGlob)) {
          continue;
        }

        let text;
        try {
          text = await fsp.readFile(fullPath, 'utf8');
        } catch {
          continue;
        }

        const lines = text.split(/\r?\n/);
        lines.forEach((line, index) => {
          if (line.includes(query)) {
            matches.push(`${this.relative(fullPath)}:${index + 1}:${line}`);
          }
        });

        if (Buffer.byteLength(matches.join('\n')) > maxOutput) {
          return;
        }
      }
    };

    await visit(target);
    return {
      engine: 'fallback',
      stdout: truncate(matches.join('\n'), maxOutput),
      stderr: '',
      exitCode: matches.length ? 0 : 1
    };
  }

  async writeFile({ path: requested, content = '', expectedSha256 = '' } = {}) {
    if (!requested) {
      throw new Error('write_file requires args.path.');
    }

    const filePath = this.resolvePath(requested);
    if (fs.existsSync(filePath)) {
      const current = await fsp.readFile(filePath, 'utf8');
      const currentHash = sha256(current);
      const expected = expectedSha256 || this.readHashes.get(filePath) || '';
      if (!expected) {
        throw new Error(
          `Refusing to overwrite ${requested} before reading it. Use read_file, then pass its sha256 or write again in this run.`,
        );
      }
      if (currentHash !== expected) {
        throw new Error(`Hash mismatch for ${requested}. Expected ${expected}, got ${currentHash}.`);
      }
    }

    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    await fsp.writeFile(filePath, String(content), 'utf8');
    const result = {
      path: this.relative(filePath),
      bytes: Buffer.byteLength(String(content)),
      sha256: sha256(String(content))
    };
    this.readHashes.set(filePath, result.sha256);
    this.changedFiles.add(result.path);
    return result;
  }

  async replaceInFile({
    path: requested,
    find,
    replace = '',
    expectedReplacements = 1,
    expectedSha256 = ''
  } = {}) {
    if (!requested || typeof find !== 'string') {
      throw new Error('replace_in_file requires args.path and literal args.find.');
    }

    const filePath = this.resolvePath(requested);
    const current = await fsp.readFile(filePath, 'utf8');
    const currentHash = sha256(current);
    if (expectedSha256 && currentHash !== expectedSha256) {
      throw new Error(`Hash mismatch for ${requested}. Expected ${expectedSha256}, got ${currentHash}.`);
    }

    const count = current.split(find).length - 1;
    if (count !== expectedReplacements) {
      throw new Error(`Expected ${expectedReplacements} replacements in ${requested}, found ${count}.`);
    }

    const next = current.split(find).join(String(replace));
    await fsp.writeFile(filePath, next, 'utf8');
    const result = {
      path: this.relative(filePath),
      replacements: count,
      beforeSha256: currentHash,
      afterSha256: sha256(next)
    };
    this.readHashes.set(filePath, result.afterSha256);
    this.changedFiles.add(result.path);
    return result;
  }

  async makeDir({ path: requested } = {}) {
    if (!requested) {
      throw new Error('make_dir requires args.path.');
    }

    const dirPath = this.resolvePath(requested);
    await fsp.mkdir(dirPath, { recursive: true });
    const result = { path: this.relative(dirPath) };
    this.changedFiles.add(result.path);
    return result;
  }

  async runCommand({ command, args = [], cwd = '.', timeoutMs = 120000 } = {}) {
    if (!command) {
      throw new Error('run_command requires args.command.');
    }
    if (!Array.isArray(args)) {
      throw new Error('run_command args.args must be an array.');
    }

    const before = await this.captureGitState(cwd);
    const result = await this.runProcess(command, args, { timeoutMs, cwd });
    const after = await this.captureGitState(cwd);
    const observedChanges = this.compareGitStates(before, after);
    for (const changed of observedChanges) this.changedFiles.add(changed);
    this.verifications.push({
      command: [command, ...args.map(String)].join(' '),
      cwd: this.relative(this.resolvePath(cwd)),
      exitCode: result.exitCode,
      signal: result.signal || '',
      observedChanges,
    });
    return { ...result, observedChanges };
  }

  async captureGitState(cwd = '.') {
    const rootResult = await this.runProcess(
      'git',
      ['rev-parse', '--show-toplevel'],
      { timeoutMs: 15000, cwd },
    );
    if (rootResult.exitCode !== 0) return null;
    const gitRoot = rootResult.stdout.trim();
    if (!gitRoot) return null;

    const [headResult, statusResult] = await Promise.all([
      this.runProcess('git', ['rev-parse', 'HEAD'], { timeoutMs: 15000, cwd: gitRoot }),
      this.runProcess(
        'git',
        ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
        { timeoutMs: 30000, cwd: gitRoot },
      ),
    ]);
    if (statusResult.exitCode !== 0 || statusResult.stdout.includes('[truncated ')) {
      return { gitRoot, head: headResult.exitCode === 0 ? headResult.stdout.trim() : '', files: null };
    }

    const entries = statusResult.stdout.split('\0').filter(Boolean);
    const paths = [];
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      if (entry.length < 4) continue;
      const status = entry.slice(0, 2);
      paths.push(entry.slice(3));
      if (/[RC]/.test(status) && entries[index + 1]) paths.push(entries[++index]);
    }

    const files = new Map();
    for (const requested of paths.slice(0, 5000)) {
      const filePath = path.resolve(gitRoot, requested);
      try {
        const stat = await fsp.stat(filePath);
        if (!stat.isFile()) {
          files.set(filePath, `<${stat.isDirectory() ? 'directory' : 'other'}>`);
          continue;
        }
        const content = await fsp.readFile(filePath);
        files.set(filePath, crypto.createHash('sha256').update(content).digest('hex'));
      } catch {
        files.set(filePath, '<missing>');
      }
    }
    return {
      gitRoot,
      head: headResult.exitCode === 0 ? headResult.stdout.trim() : '',
      files,
      incomplete: paths.length > 5000,
    };
  }

  compareGitStates(before, after) {
    if (!before || !after || before.gitRoot !== after.gitRoot) return [];
    const changed = new Set();
    if (before.head && after.head && before.head !== after.head) changed.add('git:HEAD');
    if (!before.files || !after.files) return [...changed];
    const paths = new Set([...before.files.keys(), ...after.files.keys()]);
    for (const filePath of paths) {
      if (before.files.get(filePath) !== after.files.get(filePath)) {
        changed.add(this.relative(filePath));
      }
    }
    if (before.incomplete || after.incomplete) changed.add('git:working-tree-incomplete');
    return [...changed];
  }

  async gitDiff({ path: requested = '.', staged = false, maxBytes } = {}) {
    const args = ['diff', '--no-ext-diff', '--no-color'];
    if (staged) args.push('--cached');
    if (requested && requested !== '.') args.push('--', requested);
    const result = await this.runProcess('git', args, { timeoutMs: 30000 });
    return {
      ...result,
      stdout: truncate(result.stdout, maxBytes ?? this.config.agent.maxCommandOutputBytes),
    };
  }

  async loadHarness({ includeSourceLibrary = false } = {}) {
    const snapshot = await loadHarnessSnapshot(this.config, {
      includeSource: Boolean(includeSourceLibrary)
    });
    return {
      root: snapshot.root,
      coreFiles: snapshot.loaded.map((file) => file.path),
      sourceFiles: snapshot.sourceFiles,
      loadedSourceFiles: snapshot.loadedSource.map((file) => file.path),
      truncated: snapshot.truncated,
      prompt: buildHarnessPrompt(snapshot)
    };
  }

  async runProcess(command, args = [], options = {}) {
    return new Promise((resolve) => {
      const cwd = options.cwd ? this.resolvePath(options.cwd) : this.root;
      const commandArgs = args.map(String);
      const useWindowsShell = process.platform === 'win32';
      const child = spawn(useWindowsShell ? windowsShellCommand(command, commandArgs) : command, useWindowsShell ? [] : commandArgs, {
        cwd,
        env: withCommandEnv(),
        shell: useWindowsShell,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let settled = false;
      let timedOut = false;
      const abort = () => {
        if (!settled) child.kill('SIGKILL');
      };
      const maxOutput = this.config.agent.maxCommandOutputBytes;
      const timeout = setTimeout(() => {
        if (!settled) {
          timedOut = true;
          child.kill('SIGKILL');
        }
      }, options.timeoutMs ?? 120000);
      this.signal?.addEventListener('abort', abort, { once: true });

      child.stdout.on('data', (chunk) => {
        stdout = truncate(stdout + chunk.toString(), maxOutput);
      });
      child.stderr.on('data', (chunk) => {
        stderr = truncate(stderr + chunk.toString(), maxOutput);
      });
      child.on('error', (error) => {
        clearTimeout(timeout);
        this.signal?.removeEventListener('abort', abort);
        settled = true;
        resolve({
          command,
          args,
          cwd,
          exitCode: null,
          stdout,
          stderr: error.message,
          cancelled: Boolean(this.signal?.aborted),
          timedOut,
        });
      });
      child.on('close', (code, signal) => {
        clearTimeout(timeout);
        this.signal?.removeEventListener('abort', abort);
        settled = true;
        resolve({
          command,
          args,
          cwd,
          exitCode: code,
          signal,
          stdout,
          stderr,
          cancelled: Boolean(this.signal?.aborted),
          timedOut,
        });
      });
    });
  }

  executionEvidence() {
    return {
      changedFiles: [...this.changedFiles],
      verifications: [...this.verifications],
    };
  }
}
