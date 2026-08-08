import { buildHarnessPrompt, loadHarnessSnapshot } from './harness.js';
import { emitSignal, say } from './session.js';

const STEP_STATUSES = new Set(['pending', 'in_progress', 'completed', 'skipped']);
const ACTIONS_REQUIRING_PLAN = new Set([
  'write_file',
  'replace_in_file',
  'make_dir',
  'run_command',
]);
const MAX_CONSECUTIVE_FAILURES = 3;
const MAX_IDENTICAL_OUTCOMES = 3;

function truncateForModel(value, max = 40000) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n[truncated ${text.length - max} chars]`;
}

function stripCodeFence(text) {
  const trimmed = String(text).trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(String).filter(Boolean))];
}

function commandEvidence(item) {
  return `${item.command}${item.cwd && item.cwd !== '.' ? ` (in ${item.cwd})` : ''}: exit ${item.exitCode}`;
}

export function parseAgentJson(raw) {
  const text = stripCodeFence(raw);
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first >= 0 && last > first) return JSON.parse(text.slice(first, last + 1));
    throw new Error('Assistant response was not valid JSON.');
  }
}

function buildSystemPrompt(config, tools, harnessPrompt) {
  const name = config.agent.name || 'Aligned Coding Agent';
  const parts = [
    `You are ${name}, a local-first senior software engineering agent.`,
    'You are the coding edition of Aligned Agent OS: one entity, one private brain, one accountable work loop.',
    '',
    'Workspace:',
    config.agent.workspace,
    '',
    'Working contract:',
    '- Return exactly one JSON object per turn. No markdown or prose outside JSON.',
    '- Use one action per response and keep "reason" to one concrete sentence.',
    '- Begin every coding task with a short plan. Make 2-8 observable steps.',
    '- Mark exactly one step in_progress before changing files or running commands.',
    '- Inspect before editing. Search instead of guessing. Preserve unknown user changes.',
    '- Before every tool action, include "expected" (the observable result you predict) and "verification" (how that result will be checked). These are concise execution fields, not private chain-of-thought.',
    '- Existing files must be read before full overwrite; sha256 preconditions protect concurrent work.',
    '- Make the smallest coherent change that fully handles the task.',
    '- Use structured write tools for source edits. Commands are for project tools, builds, tests, and workflows whose side effects you understand.',
    '- After edits, run the narrowest meaningful verification. A successful command is required before final.',
    '- Complete or skip every plan step before final. Never claim a file or test the runtime did not observe.',
    '- Tool failures are evidence. Diagnose them, adjust the plan, and continue when possible.',
    '- Stop after three consecutive tool failures or three identical action outcomes. Do not burn turns repeating a move that produces no new evidence.',
    '- Use request_approval when operator judgment is genuinely needed for direction, scope, cost, or irreversible impact.',
    '- Approval is a coordination channel, not a substitute for technical judgment.',
    '- Store durable coding judgment or continuity in the coding room only when it will matter after this run.',
    '- Finish with action "final" only when the execution ledger supports completion or a real blocker is explained.',
    '',
    'Workflow actions:',
    JSON.stringify([
      {
        action: 'plan',
        args: {
          goal: 'Short outcome',
          steps: [
            { id: '1', title: 'Inspect the relevant implementation' },
            { id: '2', title: 'Make the focused change' },
            { id: '3', title: 'Verify the result' },
          ],
        },
      },
      {
        action: 'mark_step',
        args: { id: '1', status: 'in_progress', note: 'Reading the implementation.' },
      },
      {
        action: 'request_approval',
        args: {
          question: 'Which behavior should be authoritative?',
          proposedAction: 'Proceed with option A.',
          reason: 'The choice changes the public contract.',
        },
      },
      {
        action: 'final',
        summary: 'Outcome, stated plainly.',
        changedFiles: [],
        tests: [],
        notes: [],
      },
    ], null, 2),
    '',
    'Tool actions:',
    JSON.stringify(tools.listToolDescriptions(), null, 2),
    '',
    'Examples:',
    '{"reason":"I need an evidence-based work order first.","action":"plan","args":{"goal":"Repair the failing workflow","steps":[{"id":"1","title":"Inspect the failure and relevant code"},{"id":"2","title":"Implement the smallest fix"},{"id":"3","title":"Run the focused checks"}]}}',
    '{"reason":"I am beginning repository inspection.","action":"mark_step","args":{"id":"1","status":"in_progress","note":"Inspecting status and source files."}}',
    '{"reason":"I need the current file and its hash before editing.","action":"read_file","expected":"The current source and sha256 will be returned.","verification":"Check that the tool result contains content and sha256.","args":{"path":"src/index.js"}}',
    '{"reason":"The implementation and verification are complete.","action":"final","summary":"Fixed the workflow and verified it.","changedFiles":["src/index.js"],"tests":["npm test"],"notes":[]}',
  ];

  if (harnessPrompt?.trim()) {
    parts.splice(6, 0, '', 'Private coding harness context:', harnessPrompt.trim());
  }
  return parts.join('\n');
}

export class AlignedCodingAgent {
  constructor({ config, provider, tools, journal, approvalHandler = null, eventHandler = null }) {
    this.config = config;
    this.provider = provider;
    this.tools = tools;
    this.journal = journal;
    this.approvalHandler = approvalHandler;
    this.eventHandler = eventHandler;
    this.resetExecution();
  }

  resetExecution() {
    this.plan = null;
    this.lastMutationTurn = 0;
    this.lastSuccessfulVerificationTurn = 0;
    this.protocolCorrections = 0;
    this.consecutiveToolFailures = 0;
    this.identicalOutcomeCount = 0;
    this.lastOutcomeFingerprint = '';
    this.executionReceipts = [];
  }

  publish(type, payload = {}) {
    if (!this.eventHandler) return;
    try {
      this.eventHandler({ type, payload, at: new Date().toISOString() });
    } catch {
      // Presentation events must never interrupt the coding loop.
    }
  }

  correction(messages, message, details = {}) {
    this.protocolCorrections += 1;
    this.publish('protocol_correction', { message, ...details });
    messages.push({
      role: 'user',
      content: [
        'Execution ledger correction:',
        message,
        '',
        'Return the next single JSON action.',
      ].join('\n'),
    });
  }

  planGate(action) {
    if (!ACTIONS_REQUIRING_PLAN.has(action.action)) return null;
    if (!this.plan) {
      return `Create a plan before ${action.action}.`;
    }
    const active = this.plan.steps.filter((step) => step.status === 'in_progress');
    if (active.length !== 1) {
      return `Mark exactly one plan step in_progress before ${action.action}.`;
    }
    return null;
  }

  predictionGate(action) {
    const expected = String(action.expected ?? '').trim();
    const verification = String(action.verification ?? '').trim();
    if (!expected || !verification) {
      return `Before ${action.action}, include concise string fields "expected" and "verification".`;
    }
    return null;
  }

  finalGate() {
    if (!this.plan) return 'Create and execute a plan before finishing.';
    const open = this.plan.steps.filter((step) => !['completed', 'skipped'].includes(step.status));
    if (open.length) {
      return `Resolve every plan step before final. Still open: ${open.map((step) => `${step.id}:${step.status}`).join(', ')}.`;
    }

    const evidence = this.tools.executionEvidence();
    if (evidence.changedFiles.length) {
      const successful = evidence.verifications.filter((item) => item.exitCode === 0);
      if (!successful.length || this.lastSuccessfulVerificationTurn < this.lastMutationTurn) {
        return 'Files changed after the last successful verification. Run the narrowest meaningful check before final.';
      }
    }
    return '';
  }

  async runTask(task, {
    recovery = '',
    includeHarness = true,
    includeSourceLibrary = false,
    signal = null,
  } = {}) {
    this.resetExecution();
    let harnessPrompt = '';
    if (includeHarness) {
      const harnessSnapshot = await loadHarnessSnapshot(this.config, {
        includeSource: includeSourceLibrary,
      });
      harnessPrompt = buildHarnessPrompt(harnessSnapshot);
      const harnessEvent = {
        root: harnessSnapshot.root,
        coreFiles: harnessSnapshot.loaded.map((file) => file.path),
        sourceFiles: harnessSnapshot.sourceFiles,
        loadedSourceFiles: harnessSnapshot.loadedSource.map((file) => file.path),
        sourceLoaded: harnessSnapshot.sourceLoaded,
        truncated: harnessSnapshot.truncated,
      };
      await this.journal?.append('harness.loaded', harnessEvent);
      emitSignal(this.config, 'harness_loaded', harnessEvent);
      this.publish('harness_loaded', {
        ...harnessEvent,
        coreFiles: harnessSnapshot.loaded.length,
        sourceFiles: harnessSnapshot.sourceFiles.length,
        loadedSourceFiles: harnessSnapshot.loadedSource.length,
      });
    }

    const messages = [
      { role: 'system', content: buildSystemPrompt(this.config, this.tools, harnessPrompt) },
      {
        role: 'user',
        content: [
          'Task:',
          task,
          recovery ? `\nRecovery context:\n${recovery}` : '',
          '',
          'Begin with a plan.',
        ].join('\n'),
      },
    ];

    await this.journal?.append('task.start', { task });
    emitSignal(this.config, 'task_started', { task });
    this.publish('task_started', { task });

    for (let turn = 1; turn <= this.config.agent.maxTurns; turn += 1) {
      if (signal?.aborted) return this.cancelledResult();
      emitSignal(this.config, 'model_turn_started', { turn });
      this.publish('model_turn_started', { turn });

      let raw;
      try {
        raw = await this.provider.complete(messages, { signal });
      } catch (error) {
        if (signal?.aborted || error.details?.cancelled) return this.cancelledResult();
        await this.journal?.append('provider.error', {
          message: error.message,
          details: error.details ?? {},
        });
        emitSignal(this.config, 'provider_error', { message: error.message });
        this.publish('provider_error', { message: error.message });
        return this.failedResult(error.message, 'Provider request failed before task completion.');
      }

      await this.journal?.append('assistant.raw', { turn, raw });
      messages.push({ role: 'assistant', content: raw });

      let action;
      try {
        action = parseAgentJson(raw);
      } catch (error) {
        this.correction(messages, `Your response was invalid JSON: ${error.message}`);
        continue;
      }
      if (!action || typeof action.action !== 'string') {
        this.correction(messages, 'The JSON object requires a string field named "action".');
        continue;
      }

      if (action.action === 'final') {
        const gate = this.finalGate();
        if (gate) {
          this.correction(messages, gate, { action: 'final' });
          continue;
        }
        return this.completeResult(action);
      }

      const workflowResult = await this.handleWorkflowAction(action);
      if (workflowResult) {
        messages.push({
          role: 'user',
          content: [
            `Workflow result for ${action.action}:`,
            truncateForModel(workflowResult),
            '',
            'Continue with the next single JSON action.',
          ].join('\n'),
        });
        continue;
      }

      const gate = this.planGate(action);
      if (gate) {
        this.correction(messages, gate, { action: action.action });
        continue;
      }

      const predictionGate = this.predictionGate(action);
      if (predictionGate) {
        this.correction(messages, predictionGate, { action: action.action });
        continue;
      }

      emitSignal(this.config, 'tool_started', {
        turn,
        action: action.action,
        reason: action.reason ?? '',
      });
      this.publish('tool_started', {
        turn,
        action: action.action,
        reason: action.reason ?? '',
        args: action.args ?? {},
      });

      const result = await this.tools.run(action.action, action.args ?? {});
      if (result.ok && ['write_file', 'replace_in_file', 'make_dir'].includes(action.action)) {
        this.lastMutationTurn = turn;
      }
      if (
        result.ok &&
        action.action === 'run_command' &&
        result.result?.observedChanges?.length
      ) {
        this.lastMutationTurn = turn;
      }
      if (
        result.ok &&
        action.action === 'run_command' &&
        result.result?.exitCode === 0
      ) {
        this.lastSuccessfulVerificationTurn = turn;
      }

      const outcomeFingerprint = JSON.stringify({
        action: action.action,
        args: action.args ?? {},
        ok: result.ok,
        result: result.ok ? result.result : result.error,
      });
      if (result.ok) this.consecutiveToolFailures = 0;
      else this.consecutiveToolFailures += 1;
      if (outcomeFingerprint === this.lastOutcomeFingerprint) {
        this.identicalOutcomeCount += 1;
      } else {
        this.identicalOutcomeCount = 1;
        this.lastOutcomeFingerprint = outcomeFingerprint;
      }
      const receipt = {
        turn,
        action: action.action,
        expected: String(action.expected),
        verification: String(action.verification),
        observed: result.ok
          ? truncateForModel(result.result, 4000)
          : String(result.error || 'Tool action failed.'),
        ok: result.ok,
        consecutiveToolFailures: this.consecutiveToolFailures,
        identicalOutcomeCount: this.identicalOutcomeCount,
      };
      this.executionReceipts.push(receipt);
      await this.journal?.append('workflow.receipt', receipt);
      this.publish('workflow_receipt', receipt);

      emitSignal(this.config, 'tool_finished', {
        turn,
        action: action.action,
        ok: result.ok,
      });
      this.publish('tool_finished', {
        turn,
        action: action.action,
        ok: result.ok,
        result: result.ok ? result.result : { error: result.error },
      });

      if (
        this.consecutiveToolFailures >= MAX_CONSECUTIVE_FAILURES ||
        this.identicalOutcomeCount >= MAX_IDENTICAL_OUTCOMES
      ) {
        const cause = this.consecutiveToolFailures >= MAX_CONSECUTIVE_FAILURES
          ? `${MAX_CONSECUTIVE_FAILURES} consecutive tool failures`
          : `${MAX_IDENTICAL_OUTCOMES} identical action outcomes`;
        const stopped = this.failedResult(
          `Stopped after ${cause}.`,
          'The execution loop halted instead of spending more turns without new evidence.',
        );
        await this.journal?.append('task.no_progress', stopped);
        emitSignal(this.config, 'task_stopped', stopped);
        this.publish('task_stopped', stopped);
        return stopped;
      }

      messages.push({
        role: 'user',
        content: [
          `Tool result for ${action.action}:`,
          truncateForModel(result),
          '',
          'Use this evidence. Continue with the next single JSON action.',
        ].join('\n'),
      });
    }

    const result = this.failedResult(
      `Stopped after maxTurns=${this.config.agent.maxTurns}.`,
      'Increase the turn budget or narrow the task.',
    );
    await this.journal?.append('task.max_turns', result);
    emitSignal(this.config, 'task_stopped', result);
    this.publish('task_stopped', result);
    return result;
  }

  async handleWorkflowAction(action) {
    if (action.action === 'plan') {
      const args = action.args ?? {};
      const sourceSteps = Array.isArray(args.steps) ? args.steps : [];
      if (sourceSteps.length < 2 || sourceSteps.length > 8) {
        return {
          ok: false,
          error: 'A plan requires 2-8 observable steps.',
        };
      }
      this.plan = {
        goal: String(args.goal || 'Complete the coding task'),
        steps: sourceSteps.map((step, index) => ({
          id: String(step.id ?? index + 1),
          title: String(step.title ?? step.description ?? `Step ${index + 1}`),
          status: 'pending',
          note: '',
        })),
      };
      await this.journal?.append('workflow.plan', this.plan);
      emitSignal(this.config, 'workflow_plan', this.plan);
      this.publish('workflow_plan', this.plan);
      return { ok: true, plan: this.plan };
    }

    if (action.action === 'mark_step') {
      if (!this.plan) return { ok: false, error: 'Create a plan first.' };
      const args = action.args ?? {};
      const id = String(args.id ?? '');
      const status = String(args.status || 'in_progress');
      if (!STEP_STATUSES.has(status)) {
        return { ok: false, error: `Unknown step status: ${status}` };
      }
      const step = this.plan.steps.find((candidate) => candidate.id === id);
      if (!step) return { ok: false, error: `Plan step ${id} does not exist.` };
      if (status === 'in_progress') {
        for (const other of this.plan.steps) {
          if (other.id !== id && other.status === 'in_progress') other.status = 'pending';
        }
      }
      step.status = status;
      step.note = String(args.note || '');
      const result = { ok: true, id, status, note: step.note, plan: this.plan };
      await this.journal?.append('workflow.step', result);
      emitSignal(this.config, 'workflow_step', result);
      this.publish('workflow_step', result);
      return result;
    }

    if (action.action === 'request_approval') {
      const args = action.args ?? {};
      const request = {
        question: args.question ?? 'Approve this action?',
        proposedAction: args.proposedAction ?? '',
        reason: args.reason ?? '',
        at: new Date().toISOString(),
      };
      emitSignal(this.config, 'approval_requested', request);
      this.publish('approval_requested', request);
      await this.journal?.append('approval.requested', request);
      const response = this.approvalHandler
        ? await this.approvalHandler(request)
        : {
            approved: false,
            answer: 'unavailable',
            note: 'No interactive approval channel is active.',
          };
      const result = { ok: true, request, response };
      await this.journal?.append('approval.resolved', result);
      emitSignal(this.config, 'approval_resolved', result);
      this.publish('approval_resolved', result);
      return result;
    }

    return null;
  }

  async completeResult(action) {
    const evidence = this.tools.executionEvidence();
    const observedTests = evidence.verifications.map(commandEvidence);
    const result = {
      ok: true,
      summary: action.summary ?? action.reason ?? 'Task complete.',
      changedFiles: uniqueStrings(evidence.changedFiles),
      tests: uniqueStrings(observedTests),
      notes: uniqueStrings(action.notes ?? []),
      plan: this.plan,
      evidence: {
        verifications: evidence.verifications,
        protocolCorrections: this.protocolCorrections,
        receipts: [...this.executionReceipts],
      },
    };
    await this.journal?.append('task.final', result);
    emitSignal(this.config, 'task_completed', result);
    this.publish('task_completed', result);
    say(this.config, result.summary);
    return result;
  }

  failedResult(summary, note) {
    const evidence = this.tools.executionEvidence();
    return {
      ok: false,
      summary,
      changedFiles: evidence.changedFiles,
      tests: evidence.verifications.map(commandEvidence),
      notes: note ? [note] : [],
      plan: this.plan,
      evidence: {
        verifications: evidence.verifications,
        protocolCorrections: this.protocolCorrections,
        receipts: [...this.executionReceipts],
      },
    };
  }

  async cancelledResult() {
    const result = this.failedResult('Task stopped by the operator.', 'The run was cancelled.');
    await this.journal?.append('task.cancelled', result);
    emitSignal(this.config, 'task_stopped', result);
    this.publish('task_stopped', result);
    return result;
  }
}

// Backward-compatible export for the original terminal wrapper.
export const ResonantCodeAgent = AlignedCodingAgent;
