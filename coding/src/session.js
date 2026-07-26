import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

function timestampForFile() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function emitSignal(config, type, payload = {}) {
  if (config.agent?.emitRuntimeSignals === false) {
    return;
  }

  const event = {
    type,
    payload,
    at: new Date().toISOString()
  };
  process.stdout.write(`ALIGNED_CODE ${JSON.stringify(event)}\n`);
}

export function say(config, content) {
  process.stdout.write(`${config.agent?.name ?? 'Aligned Coding Agent'}: ${content}\n`);
}

export class SessionJournal {
  constructor(config, options = {}) {
    this.config = config;
    this.root = path.resolve(
      options.root ||
      config.agent.sessionRoot ||
      path.join(config.agent.workspace, '.aligned-coding-agent'),
    );
    this.sessionDir = path.join(this.root, 'sessions');
    this.sessionId = String(
      options.sessionId || `run_${timestampForFile()}_${crypto.randomUUID().slice(0, 8)}`,
    );
    this.sessionPath = path.join(this.sessionDir, `${this.sessionId}.jsonl`);
  }

  async ready() {
    await fsp.mkdir(this.sessionDir, { recursive: true });
  }

  async append(type, payload = {}) {
    await this.ready();
    const event = {
      type,
      payload,
      at: new Date().toISOString()
    };
    await fsp.appendFile(this.sessionPath, `${JSON.stringify(event)}\n`, 'utf8');
    return event;
  }

  publicState() {
    return {
      id: this.sessionId,
      path: this.sessionPath,
    };
  }
}
