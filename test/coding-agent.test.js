const assert = require("node:assert/strict");
const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { initializeRuntime } = require("../core/runtime");

async function modules() {
  const [{ AlignedCodingAgent, parseAgentJson }, { createProvider }, { ToolRegistry }, { createCodingService }] =
    await Promise.all([
      import("../coding/src/agent.js"),
      import("../coding/src/provider.js"),
      import("../coding/src/tools.js"),
      import("../coding/service.js"),
    ]);
  return { AlignedCodingAgent, parseAgentJson, createProvider, ToolRegistry, createCodingService };
}

function tempDirectory(t, prefix) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function config(workspace, overrides = {}) {
  return {
    provider: { type: "mock", model: "mock", baseUrl: "", request: {} },
    agent: {
      name: "Test Coding Entity",
      workspace,
      maxTurns: 30,
      maxReadBytes: 120000,
      maxHarnessBytes: 120000,
      maxSourceLibraryBytes: 120000,
      maxCommandOutputBytes: 24000,
      harnessPath: path.join(workspace, "harness"),
      charterPath: path.join(workspace, "CODING_CHARTER.md"),
      sessionRoot: path.join(workspace, ".sessions"),
      emitRuntimeSignals: false,
      ...overrides,
    },
  };
}

const journal = {
  async append() {},
};

test("coding protocol accepts fenced JSON but still extracts one action", async () => {
  const { parseAgentJson } = await modules();
  assert.deepEqual(
    parseAgentJson('```json\n{"action":"workspace_status","args":{}}\n```'),
    { action: "workspace_status", args: {} },
  );
});

test("coding tool actions require an observable prediction contract", async (t) => {
  const workspace = tempDirectory(t, "aligned-code-prediction-");
  const { AlignedCodingAgent, createProvider, ToolRegistry } = await modules();
  const runtimeConfig = config(workspace);
  const tools = new ToolRegistry(runtimeConfig, journal);
  const agent = new AlignedCodingAgent({
    config: runtimeConfig,
    provider: createProvider(runtimeConfig),
    tools,
    journal,
  });

  assert.match(
    agent.predictionGate({ action: "read_file", args: { path: "README.md" } }),
    /expected.*verification/,
  );
  assert.equal(
    agent.predictionGate({
      action: "read_file",
      expected: "The file content is returned.",
      verification: "Inspect the content and hash.",
      args: { path: "README.md" },
    }),
    null,
  );
});

test("offline coding smoke completes every planned step", async (t) => {
  const workspace = tempDirectory(t, "aligned-code-smoke-");
  fs.writeFileSync(path.join(workspace, "README.md"), "# Fixture\n");
  const { AlignedCodingAgent, createProvider, ToolRegistry } = await modules();
  const runtimeConfig = config(workspace);
  const tools = new ToolRegistry(runtimeConfig, journal);
  const agent = new AlignedCodingAgent({
    config: runtimeConfig,
    provider: createProvider(runtimeConfig),
    tools,
    journal,
  });
  const result = await agent.runTask("Inspect this fixture.", { includeHarness: false });
  assert.equal(result.ok, true);
  assert.equal(result.plan.steps.every((step) => step.status === "completed"), true);
  assert.deepEqual(result.changedFiles, []);
});

test("coding agent reads, edits, verifies, and reports runtime evidence", async (t) => {
  const workspace = tempDirectory(t, "aligned-code-edit-");
  fs.writeFileSync(path.join(workspace, "note.txt"), "before\n");
  fs.writeFileSync(
    path.join(workspace, "verify.js"),
    "const fs=require('node:fs');process.exit(fs.readFileSync('note.txt','utf8')==='after\\n'?0:1);\n",
  );
  const { AlignedCodingAgent, ToolRegistry } = await modules();
  const runtimeConfig = config(workspace);
  const sequence = [
    { action: "plan", args: { goal: "Update the fixture", steps: [
      { id: "1", title: "Inspect the file" },
      { id: "2", title: "Edit the file" },
      { id: "3", title: "Verify the result" },
    ] } },
    { action: "mark_step", args: { id: "1", status: "in_progress" } },
    {
      action: "read_file",
      expected: "The file contains before.",
      verification: "Inspect the returned content and sha256.",
      args: { path: "note.txt" },
    },
    { action: "mark_step", args: { id: "1", status: "completed" } },
    { action: "mark_step", args: { id: "2", status: "in_progress" } },
    {
      action: "write_file",
      expected: "note.txt contains after.",
      verification: "Check the write receipt and subsequent command.",
      args: { path: "note.txt", content: "after\n" },
    },
    { action: "mark_step", args: { id: "2", status: "completed" } },
    { action: "mark_step", args: { id: "3", status: "in_progress" } },
    {
      action: "run_command",
      expected: "The verification process exits zero.",
      verification: "Inspect the recorded exit code.",
      args: { command: "node", args: ["verify.js"] },
    },
    { action: "mark_step", args: { id: "3", status: "completed" } },
    { action: "final", summary: "Updated and verified the fixture." },
  ];
  const provider = {
    turn: 0,
    async complete() {
      return JSON.stringify(sequence[this.turn++]);
    },
  };
  const tools = new ToolRegistry(runtimeConfig, journal);
  const agent = new AlignedCodingAgent({ config: runtimeConfig, provider, tools, journal });
  const result = await agent.runTask("Change note.txt to after.", { includeHarness: false });
  assert.equal(result.ok, true);
  assert.equal(fs.readFileSync(path.join(workspace, "note.txt"), "utf8"), "after\n");
  assert.deepEqual(result.changedFiles, ["note.txt"]);
  assert.match(result.tests[0], /node verify\.js.*exit 0/);
  assert.equal(result.evidence.receipts.length, 3);
  assert.equal(result.evidence.receipts[2].expected, "The verification process exits zero.");
});

test("coding loop stops after three consecutive tool failures", async (t) => {
  const workspace = tempDirectory(t, "aligned-code-no-progress-");
  const { AlignedCodingAgent, ToolRegistry } = await modules();
  const runtimeConfig = config(workspace);
  const sequence = [
    {
      action: "plan",
      args: {
        goal: "Exercise bounded failure handling",
        steps: [
          { id: "1", title: "Attempt the tool" },
          { id: "2", title: "Report the bounded result" },
        ],
      },
    },
    { action: "mark_step", args: { id: "1", status: "in_progress" } },
    ...Array.from({ length: 3 }, () => ({
      action: "missing_tool",
      expected: "The tool returns a result.",
      verification: "Inspect the tool receipt.",
      args: {},
    })),
  ];
  const provider = {
    turn: 0,
    async complete() {
      return JSON.stringify(sequence[this.turn++]);
    },
  };
  const tools = new ToolRegistry(runtimeConfig, journal);
  const agent = new AlignedCodingAgent({ config: runtimeConfig, provider, tools, journal });
  const result = await agent.runTask("Try a missing tool.", { includeHarness: false });

  assert.equal(result.ok, false);
  assert.match(result.summary, /3 consecutive tool failures/);
  assert.equal(result.evidence.receipts.length, 3);
  assert.equal(provider.turn, 5);
});

test("coding loop stops after three identical successful outcomes", async (t) => {
  const workspace = tempDirectory(t, "aligned-code-identical-");
  fs.writeFileSync(path.join(workspace, "README.md"), "# Stable\n");
  const { AlignedCodingAgent, ToolRegistry } = await modules();
  const runtimeConfig = config(workspace);
  const repeatedAction = {
    action: "read_file",
    expected: "The unchanged file is returned.",
    verification: "Compare the content and sha256.",
    args: { path: "README.md" },
  };
  const sequence = [
    {
      action: "plan",
      args: {
        goal: "Exercise repeated-outcome handling",
        steps: [
          { id: "1", title: "Read the file" },
          { id: "2", title: "Report the bounded result" },
        ],
      },
    },
    { action: "mark_step", args: { id: "1", status: "in_progress" } },
    repeatedAction,
    repeatedAction,
    repeatedAction,
  ];
  const provider = {
    turn: 0,
    async complete() {
      return JSON.stringify(sequence[this.turn++]);
    },
  };
  const tools = new ToolRegistry(runtimeConfig, journal);
  const agent = new AlignedCodingAgent({ config: runtimeConfig, provider, tools, journal });
  const result = await agent.runTask("Repeat one read.", { includeHarness: false });

  assert.equal(result.ok, false);
  assert.match(result.summary, /3 identical action outcomes/);
  assert.equal(result.evidence.receipts.length, 3);
  assert.equal(provider.turn, 5);
});

test("long-horizon mode resets transient trajectory without losing task state", async (t) => {
  const workspace = tempDirectory(t, "aligned-code-long-horizon-");
  const { AlignedCodingAgent, ToolRegistry } = await modules();
  const runtimeConfig = config(workspace, { maxTurns: 5, longHorizonMode: "auto" });
  const messageCounts = [];
  const sequence = [
    {
      action: "plan",
      args: {
        goal: "Exercise bounded long-horizon state",
        steps: Array.from({ length: 5 }, (_, index) => ({
          id: String(index + 1),
          title: `Step ${index + 1}`,
          acceptance: `Observable evidence for step ${index + 1}`,
        })),
      },
    },
    { action: "mark_step", args: { id: "1", status: "in_progress" } },
    {
      action: "workspace_status",
      expected: "Workspace status is returned.",
      verification: "Inspect the runtime tool receipt.",
      args: {},
    },
    { action: "mark_step", args: { id: "1", status: "completed" } },
    { action: "mark_step", args: { id: "2", status: "in_progress" } },
  ];
  const provider = {
    turn: 0,
    async complete(messages) {
      messageCounts.push(messages.length);
      return JSON.stringify(sequence[this.turn++]);
    },
  };
  const tools = new ToolRegistry(runtimeConfig, journal);
  const events = [];
  const agent = new AlignedCodingAgent({
    config: runtimeConfig,
    provider,
    tools,
    journal,
    eventHandler: (event) => events.push(event),
  });
  const result = await agent.runTask("Run a five-step fixture.", { includeHarness: false });
  assert.equal(result.ok, false);
  assert.equal(messageCounts[4], 3);
  assert.equal(events.some((event) => event.type === "workflow_context_reset"), true);
  assert.equal(agent.contextResetCount, 1);
  assert.equal(agent.plan.goal, "Exercise bounded long-horizon state");
  assert.equal(agent.executionReceipts[0].stepId, "1");
});

test("long-horizon plans require observable acceptance conditions", async (t) => {
  const workspace = tempDirectory(t, "aligned-code-long-horizon-contract-");
  const { AlignedCodingAgent, createProvider, ToolRegistry } = await modules();
  const runtimeConfig = config(workspace, { longHorizonMode: "auto" });
  const tools = new ToolRegistry(runtimeConfig, journal);
  const agent = new AlignedCodingAgent({
    config: runtimeConfig,
    provider: createProvider(runtimeConfig),
    tools,
    journal,
  });
  const result = await agent.handleWorkflowAction({
    action: "plan",
    args: {
      goal: "Reject an unverifiable long plan",
      steps: Array.from({ length: 5 }, (_, index) => ({
        id: String(index + 1),
        title: `Step ${index + 1}`,
      })),
    },
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /observable acceptance condition/i);
});

test("long-horizon steps cannot complete from an unsupported model claim", async (t) => {
  const workspace = tempDirectory(t, "aligned-code-long-horizon-evidence-");
  const { AlignedCodingAgent, createProvider, ToolRegistry } = await modules();
  const runtimeConfig = config(workspace, { longHorizonMode: "always" });
  const tools = new ToolRegistry(runtimeConfig, journal);
  const agent = new AlignedCodingAgent({
    config: runtimeConfig,
    provider: createProvider(runtimeConfig),
    tools,
    journal,
  });
  await agent.handleWorkflowAction({
    action: "plan",
    args: {
      goal: "Reject unsupported completion",
      steps: [
        { id: "1", title: "Inspect", acceptance: "A runtime receipt exists." },
        { id: "2", title: "Report", acceptance: "The verified result is reported." },
      ],
    },
  });
  await agent.handleWorkflowAction({
    action: "mark_step",
    args: { id: "1", status: "in_progress" },
  });
  const result = await agent.handleWorkflowAction({
    action: "mark_step",
    args: { id: "1", status: "completed" },
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /successful runtime receipt/i);
  assert.equal(agent.plan.steps[0].status, "in_progress");
});

test("command side effects in a git workspace enter the runtime evidence ledger", async (t) => {
  if (spawnSync("git", ["--version"], { windowsHide: true }).status !== 0) {
    t.skip("git is not installed");
    return;
  }
  const workspace = tempDirectory(t, "aligned-code-command-change-");
  fs.writeFileSync(path.join(workspace, "README.md"), "# Fixture\n");
  execFileSync("git", ["init", "-q"], { cwd: workspace, windowsHide: true });
  execFileSync("git", ["add", "README.md"], { cwd: workspace, windowsHide: true });
  execFileSync(
    "git",
    ["-c", "user.name=Aligned Test", "-c", "user.email=aligned@example.invalid", "commit", "-qm", "fixture"],
    { cwd: workspace, windowsHide: true },
  );

  const { ToolRegistry } = await modules();
  const tools = new ToolRegistry(config(workspace), journal);
  const result = await tools.run("run_command", {
    command: "node",
    args: ["-e", "require('node:fs').writeFileSync('generated.txt','observed\\n')"],
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.result.observedChanges, ["generated.txt"]);
  assert.deepEqual(tools.executionEvidence().changedFiles, ["generated.txt"]);
});

test("Coding Service uses a separate private runtime and streams mock work", async (t) => {
  const root = path.resolve(__dirname, "..");
  const runtimeHome = tempDirectory(t, "aligned-code-home-");
  const project = tempDirectory(t, "aligned-code-project-");
  fs.writeFileSync(path.join(project, "README.md"), "# Project\n");
  const runtime = initializeRuntime({ appRoot: root, runtimeHome });
  const { createCodingService } = await modules();
  const service = await createCodingService({ runtime, appRoot: root });
  await service.configure({ workspace: project });
  const events = [];
  const output = await service.runTask("Inspect the project.", {
    mock: true,
    onEvent: (event) => events.push(event),
  });
  assert.equal(output.result.ok, true);
  assert.equal((await service.status()).agent.workspace, path.resolve(project));
  assert.equal(events.some((event) => event.type === "workflow_plan"), true);
  assert.equal(events.some((event) => event.type === "task_finished"), true);
  assert.match(output.journal.path, /sessions[\\/]code_/);
});
