<p align="center">
  <img src="assets/resonant-agent-logo.png" alt="Aligned Coding Agent OS" width="320">
</p>

# Aligned Coding Agent OS

**Give intelligence a private place to build.**

Aligned Coding Agent OS is the Coding Edition of Aligned Agent OS: one
owner-controlled engineering partner, one persistent External Brain, and one
observable plan → inspect → execute → verify loop.

It combines the proven local Aligned interface and Cognitive Harness with the
RESONANT Coding Agent runtime. The ordinary relationship remains available in
Chat, while the Code Workbench exposes the agent's workspace, live plan,
actions, coordination requests, and verification evidence.

## The coding loop

For every non-trivial task, the coding agent must:

1. create a concrete plan with two to eight steps;
2. keep exactly one step active;
3. inspect relevant files before changing them;
4. make the smallest coherent change;
5. verify the resulting system after the last change;
6. reconcile the plan and report only observed evidence.

The runtime—not the model's prose—tracks files changed and commands used for
verification. A run cannot declare success while plan steps remain open or
while a changed file has not been followed by successful verification.

## What is included

- **Code Workbench:** Select any existing local project folder, assign a task,
  watch the plan and tool timeline, answer coordination requests, and stop the
  run.
- **Coding Room:** Persistent engineering judgment, operating model, working
  loop, and self-authored coding continuity.
- **Private sessions:** Every coding run receives a durable local journal.
- **Exact-session restart:** Every web conversation owns an isolated Pi session
  directory. After a response, Coding Agent OS pins the exact model-native
  session and reopens that file after restart instead of guessing from recent
  activity.
- **Provider choice:** Local OpenAI-compatible servers and Ollama, plus Gemini,
  OpenAI, OpenRouter, and Anthropic through buyer-owned credentials.
- **Aligned interfaces:** Local chat, Knowledge Rooms, Living Libraries,
  browser voice, terminal mode, Telegram, heartbeat, backup, and restore.
- **Separate runtime:** Coding Edition defaults to
  `~/.aligned-coding-agent-os`, so it does not overwrite a general Aligned
  Agent OS installation.

The Resonant Mesh is intentionally not embedded. It remains a separate product
for connecting agents when an operator actually wants a network.

## Windows start

Extract the release ZIP and double-click:

```text
install.bat
```

The installer creates the private runtime and opens guided setup. No Git or
manual JSON editing is required. After setup, open **Code**, choose a project
folder, and assign the first task.

## Terminal start

From the extracted source:

```text
start.bat --terminal
```

Or:

```text
npm run coding -- --workspace "C:\path\to\project"
```

## macOS or Linux

```bash
chmod +x install.sh
./install.sh
```

These launchers are included, but Windows is the currently validated platform.

## Requirements

- Node.js 22 or newer
- The Pi runtime installed by the included installer
- A local model endpoint or a buyer-supplied provider key

Python 3.10+ is optional for diagnostics and compatibility interfaces.

## Product boundary

The OS owns installation, interfaces, provider wiring, local storage, coding
execution, evidence, backups, and security. The Cognitive Harness owns identity,
memory meaning, alignment, and self-authored continuity. The selected model
supplies intelligence. The operator selects projects, credentials, permissions,
and consequential actions.

See `QUICK_START.md`, `SECURITY.md`,
`docs/COGNITIVE-HARNESS-CONTRACT.md`, and `coding/CODING_CHARTER.md`.

## Security

The local UI binds to loopback by default, rejects foreign Host and browser
Origin headers, stores secrets outside the harness, and excludes private
runtime data from release archives. A cloud provider still receives whatever
content the operator sends to that provider.

The agent can work on any folder the operator explicitly selects; this is not a
workspace jail. Review coordination requests and verification evidence in
proportion to the consequences of the task.
