#!/usr/bin/env node
import readline from 'node:readline/promises';
import process from 'node:process';

import { createCodingService } from './service.js';

function parseArgs(argv) {
  const args = { task: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--task' || value === '-t') args.task = argv[++index] || '';
    else if (value === '--workspace') args.workspace = argv[++index] || '';
    else if (value === '--wake' || value === '--orient') args.wake = true;
    else if (value === '--mock') args.mock = true;
    else if (value === '--yes' || value === '-y') args.yes = true;
    else if (value === '--help' || value === '-h') args.help = true;
    else args.task = args.task ? `${args.task} ${value}` : value;
  }
  return args;
}

function printHelp() {
  process.stdout.write(`Aligned Coding Agent OS

Usage:
  node coding/cli.js --task "Fix the failing test"
  node coding/cli.js --workspace "C:\\path\\to\\project"

Options:
  --task, -t       Run one task and exit
  --workspace      Select an existing project folder
  --wake           Run full coding orientation
  --mock           Use the offline workflow provider
  --yes, -y        Approve coordination requests automatically
  --help, -h       Show this help

Interactive:
  /status
  /workspace <path>
  /orient
  /exit
`);
}

function printEvent(event) {
  const payload = event.payload || {};
  if (event.type === 'workflow_plan') {
    process.stdout.write(`\nPlan: ${payload.goal}\n`);
    for (const step of payload.steps || []) {
      process.stdout.write(`  ${step.id}. ${step.title}\n`);
    }
  } else if (event.type === 'workflow_step') {
    process.stdout.write(`Step ${payload.id}: ${payload.status}${payload.note ? ` — ${payload.note}` : ''}\n`);
  } else if (event.type === 'tool_started') {
    process.stdout.write(`Tool: ${payload.action}${payload.reason ? ` — ${payload.reason}` : ''}\n`);
  } else if (event.type === 'tool_finished') {
    process.stdout.write(`Tool ${payload.action}: ${payload.ok ? 'done' : 'failed'}\n`);
  } else if (event.type === 'protocol_correction') {
    process.stdout.write(`Ledger: ${payload.message}\n`);
  } else if (event.type === 'task_finished') {
    const result = event.result || {};
    process.stdout.write(`\n${result.ok ? 'Done' : 'Stopped'}: ${result.summary || ''}\n`);
    if (result.changedFiles?.length) process.stdout.write(`Changed: ${result.changedFiles.join(', ')}\n`);
    if (result.tests?.length) process.stdout.write(`Verified: ${result.tests.join('; ')}\n`);
  } else if (event.type === 'error') {
    process.stderr.write(`${event.error || 'Task failed.'}\n`);
  }
}

async function runOne(service, rl, args, task, wake = false) {
  const onEvent = (event) => {
    printEvent(event);
    if (event.type !== 'approval_requested') return;
    if (args.yes) {
      service.resolveApproval(event.approvalId, { approved: true, answer: 'yes' });
      return;
    }
    const request = event.request || {};
    process.stdout.write(`\nApproval requested: ${request.question || 'Continue?'}\n`);
    if (request.proposedAction) process.stdout.write(`Proposed: ${request.proposedAction}\n`);
    if (request.reason) process.stdout.write(`Reason: ${request.reason}\n`);
    void rl.question('Approve? [y/N] ').then((answer) => {
      const approved = /^(y|yes|approve|approved)$/i.test(answer.trim());
      service.resolveApproval(event.approvalId, { approved, answer });
    });
  };
  const output = await service.runTask(task, {
    wake,
    mock: Boolean(args.mock),
    onEvent,
  });
  return output.result.ok;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const service = await createCodingService();
  if (args.workspace) await service.configure({ workspace: args.workspace });
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    if (args.task || args.wake) {
      const ok = await runOne(service, rl, args, args.task, Boolean(args.wake));
      process.exitCode = ok ? 0 : 1;
      return;
    }

    process.stdout.write('Aligned Coding Agent online. Type a task or /status.\n');
    while (true) {
      const input = (await rl.question('code> ')).trim();
      if (!input) continue;
      if (input === '/exit') break;
      if (input === '/status') {
        process.stdout.write(`${JSON.stringify(await service.status(), null, 2)}\n`);
        continue;
      }
      if (input.startsWith('/workspace ')) {
        const status = await service.configure({ workspace: input.slice(11).trim() });
        process.stdout.write(`Workspace: ${status.agent.workspace}\n`);
        continue;
      }
      await runOne(service, rl, args, input, input === '/orient');
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
