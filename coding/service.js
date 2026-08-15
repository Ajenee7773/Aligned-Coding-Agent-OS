import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { AlignedCodingAgent } from './src/agent.js';
import { createProvider } from './src/provider.js';
import { SessionJournal } from './src/session.js';
import { ToolRegistry } from './src/tools.js';
import { wakeTaskText } from './src/harness.js';

const require = createRequire(import.meta.url);
const { readJson, writeJson } = require('../core/json-store.js');
const { initializeRuntime } = require('../core/runtime.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const SUPPORTED_PROVIDER_TYPES = new Set([
  'anthropic',
  'google',
  'mock',
  'openai-compatible',
]);

const PROVIDER_BASE_URLS = {
  anthropic: 'https://api.anthropic.com/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  ollama: 'http://localhost:11434/v1',
  openai: 'https://api.openai.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
};

function publicPath(value) {
  return path.resolve(String(value || '.'));
}

function isLoopback(value) {
  try {
    const host = new URL(String(value || '')).hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return false;
  }
}

function providerType(provider) {
  if (provider === 'google' || provider === 'gemini') return 'google';
  if (provider === 'anthropic') return 'anthropic';
  return 'openai-compatible';
}

function codingSettingsPath(runtime) {
  return path.join(runtime.paths.config, 'coding.json');
}

function normalizedCodingSettings(runtime) {
  const settings = readJson(codingSettingsPath(runtime), {});
  const defaultWorkspace = path.join(runtime.home, 'projects');
  return {
    schema_version: 1,
    workspace: publicPath(settings.workspace || process.env.ALIGNED_CODING_WORKSPACE || defaultWorkspace),
    max_turns: Math.max(12, Math.min(200, Number(settings.max_turns || 80))),
  };
}

function buildConfig(runtime, { mock = false, appRoot = APP_ROOT } = {}) {
  const settings = readJson(runtime.paths.settingsFile, {});
  const credentials = readJson(runtime.paths.credentialsFile, {});
  const profile = readJson(runtime.paths.profileFile, {});
  const coding = normalizedCodingSettings(runtime);
  const selected = String(settings.runtime?.provider || '').trim().toLowerCase();
  const baseUrl =
    String(settings.runtime?.base_url || '').trim() ||
    PROVIDER_BASE_URLS[selected] ||
    '';
  const local = selected === 'ollama' || isLoopback(baseUrl);
  const apiKey = String(credentials.provider_api_key || '').trim() || (local ? 'local' : '');

  return {
    provider: {
      id: selected,
      type: mock ? 'mock' : providerType(selected),
      baseUrl,
      model: String(settings.runtime?.model || '').trim(),
      apiKey,
      timeoutMs: 180000,
      maxAttempts: 3,
      request: {
        temperature: 0.1,
        ...(Number(settings.runtime?.max_output_tokens)
          ? { max_tokens: Number(settings.runtime.max_output_tokens) }
          : {}),
      },
      headers: {},
    },
    agent: {
      name: String(profile.agent_name || 'Aligned Coding Agent'),
      operatorName: String(profile.operator_name || ''),
      mission: String(profile.mission || ''),
      workspace: coding.workspace,
      maxTurns: coding.max_turns,
      longHorizonMode: 'auto',
      maxReadBytes: 160000,
      maxHarnessBytes: 120000,
      maxSourceLibraryBytes: 360000,
      maxCommandOutputBytes: 48000,
      harnessPath: runtime.home,
      charterPath: path.join(appRoot, 'coding', 'CODING_CHARTER.md'),
      sessionRoot: path.join(runtime.paths.sessions, 'coding'),
      emitRuntimeSignals: true,
    },
  };
}

function check(label, ok, detail, repair = '') {
  return { label, ok: Boolean(ok), detail: String(detail || ''), repair: String(repair || '') };
}

export class CodingService {
  constructor({ runtime = null, appRoot = APP_ROOT } = {}) {
    this.appRoot = path.resolve(appRoot);
    this.runtime = runtime || initializeRuntime({ appRoot: this.appRoot });
    this.approvals = new Map();
    this.active = null;
  }

  async ready() {
    const coding = normalizedCodingSettings(this.runtime);
    await fsp.mkdir(coding.workspace, { recursive: true });
    await fsp.mkdir(path.join(this.runtime.paths.sessions, 'coding'), { recursive: true });
    return this;
  }

  async status() {
    const config = buildConfig(this.runtime, { appRoot: this.appRoot });
    const doctor = await this.doctor();
    return {
      activeTask: this.active
        ? {
            id: this.active.id,
            startedAt: this.active.startedAt,
            workspace: this.active.workspace,
          }
        : null,
      provider: {
        id: config.provider.id,
        type: config.provider.type,
        model: config.provider.model,
        baseUrl: config.provider.baseUrl,
        configured: doctor.ok,
      },
      agent: {
        name: config.agent.name,
        workspace: config.agent.workspace,
        harness: config.agent.harnessPath,
        sessions: config.agent.sessionRoot,
        maxTurns: config.agent.maxTurns,
        longHorizonMode: config.agent.longHorizonMode,
      },
      doctor,
    };
  }

  async doctor() {
    const config = buildConfig(this.runtime, { appRoot: this.appRoot });
    const major = Number(process.versions.node.split('.')[0]);
    const workspaceExists = fs.existsSync(config.agent.workspace);
    const codingRoom = path.join(this.runtime.paths.rooms, 'coding');
    const providerSupported = SUPPORTED_PROVIDER_TYPES.has(config.provider.type);
    const remote = config.provider.type !== 'mock' && !isLoopback(config.provider.baseUrl);
    const checks = [
      check('Node', major >= 22, process.version, 'Install Node.js 22 or newer.'),
      check('Provider', Boolean(config.provider.id && providerSupported), config.provider.id || 'Not selected', 'Choose a supported provider in setup.'),
      check('Model', Boolean(config.provider.model), config.provider.model || 'Not selected', 'Choose a model in setup.'),
      check('Endpoint', Boolean(config.provider.baseUrl) || config.provider.type === 'mock', config.provider.baseUrl || 'Missing', 'Set an OpenAI-compatible endpoint.'),
      check('API key', !remote || Boolean(config.provider.apiKey), remote ? (config.provider.apiKey ? 'Stored privately' : 'Missing') : 'Local provider'),
      check('Workspace', workspaceExists, config.agent.workspace, 'Choose an existing local project folder.'),
      check('Coding room', fs.existsSync(codingRoom), codingRoom, 'Re-run the Coding Edition installer.'),
      check('Sessions', fs.existsSync(config.agent.sessionRoot), config.agent.sessionRoot),
    ];
    return { ok: checks.every((item) => item.ok), checks };
  }

  async configure({ workspace, maxTurns } = {}) {
    if (!workspace || String(workspace).includes('\0')) {
      throw new Error('Choose a normal workspace path.');
    }
    const resolved = path.resolve(String(workspace));
    const stat = await fsp.stat(resolved).catch(() => null);
    if (!stat?.isDirectory()) {
      throw new Error('The coding workspace must be an existing directory.');
    }
    const prior = normalizedCodingSettings(this.runtime);
    const next = {
      schema_version: 1,
      workspace: resolved,
      max_turns: Number.isFinite(Number(maxTurns))
        ? Math.max(12, Math.min(200, Number(maxTurns)))
        : prior.max_turns,
      updated_at: new Date().toISOString(),
    };
    writeJson(codingSettingsPath(this.runtime), next);
    return this.status();
  }

  async runTask(task, {
    wake = false,
    mock = false,
    onEvent = () => {},
  } = {}) {
    if (this.active) throw new Error('The coding agent is already working.');
    const message = String(task || '').trim();
    if (!message && !wake) throw new Error('The coding task is empty.');

    const taskId = `code_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 6)}`;
    const controller = new AbortController();
    const config = buildConfig(this.runtime, { mock, appRoot: this.appRoot });
    const journal = new SessionJournal(config, {
      root: config.agent.sessionRoot,
      sessionId: taskId,
    });
    await journal.ready();
    const provider = createProvider(config);
    const tools = new ToolRegistry(config, journal, { signal: controller.signal });
    const emit = (event) => onEvent({ taskId, ...event });
    const agent = new AlignedCodingAgent({
      config,
      provider,
      tools,
      journal,
      eventHandler: emit,
    });

    this.active = {
      id: taskId,
      startedAt: new Date().toISOString(),
      workspace: config.agent.workspace,
      controller,
      journal: journal.publicState(),
    };

    agent.approvalHandler = (request) => this.waitForApproval(taskId, request, onEvent);
    onEvent({
      type: 'task_opened',
      taskId,
      at: new Date().toISOString(),
      task: wake ? '/orient' : message,
      workspace: config.agent.workspace,
      journal: journal.publicState(),
    });

    try {
      const result = await agent.runTask(wake ? wakeTaskText() : message, {
        includeHarness: true,
        includeSourceLibrary: wake,
        signal: controller.signal,
      });
      onEvent({
        type: 'task_finished',
        taskId,
        at: new Date().toISOString(),
        result,
      });
      return { taskId, result, journal: journal.publicState() };
    } finally {
      this.resolveTaskApprovals(taskId, {
        approved: false,
        answer: 'run-ended',
        note: 'The coding run ended before this approval was resolved.',
      });
      this.active = null;
    }
  }

  waitForApproval(taskId, request, onEvent) {
    const approvalId = `${taskId}_approval_${crypto.randomUUID().slice(0, 8)}`;
    onEvent({
      type: 'approval_requested',
      taskId,
      approvalId,
      request,
      at: new Date().toISOString(),
    });
    return new Promise((resolve) => {
      this.approvals.set(approvalId, { taskId, resolve, createdAt: Date.now() });
    });
  }

  resolveApproval(approvalId, input = {}) {
    const approval = this.approvals.get(String(approvalId));
    if (!approval) throw new Error('That approval request is no longer active.');
    this.approvals.delete(String(approvalId));
    const approved = Boolean(input.approved);
    approval.resolve({
      approved,
      answer: String(input.answer || (approved ? 'approved' : 'declined')),
      note: approved
        ? 'Operator approved from the local Coding OS interface.'
        : 'Operator declined from the local Coding OS interface.',
    });
    return { ok: true, approved };
  }

  resolveTaskApprovals(taskId, response) {
    for (const [id, approval] of this.approvals.entries()) {
      if (approval.taskId !== taskId) continue;
      this.approvals.delete(id);
      approval.resolve(response);
    }
  }

  stop() {
    if (!this.active) return { ok: true, stopped: false };
    const taskId = this.active.id;
    this.active.controller.abort(new Error('Stopped by the operator.'));
    this.resolveTaskApprovals(taskId, {
      approved: false,
      answer: 'stopped',
      note: 'The operator stopped the coding run.',
    });
    return { ok: true, stopped: true, taskId };
  }
}

export async function createCodingService(options = {}) {
  const service = new CodingService(options);
  await service.ready();
  return service;
}
