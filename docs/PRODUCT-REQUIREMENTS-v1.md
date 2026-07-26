# Aligned Agent OS — v1 Product Requirements

Status: architecture baseline
Target: Windows-first commercial release

## Product promise

Aligned Agent OS gives a non-technical buyer a private, inspectable AI partner with a configurable soul, persistent memory rooms, local or buyer-supplied cloud intelligence, voice, and optional Telegram access.

The first successful outcome is not “the files installed.” It is:

> The buyer names the agent, chooses its mission and model, has a first conversation, closes it, returns later, and sees that the relationship and approved memories persist under the buyer’s control.

## Primary buyer

The v1 buyer:

- wants an AI that feels personal rather than corporate;
- values local control and inspectable instructions;
- may not know Git, JSON, terminals, model context limits, or environment variables;
- may use a local model, but is more likely to begin with a cloud key;
- wants to talk from a desktop and optionally from a phone;
- needs the product to explain what is local, what uses the network, and where data lives.

## Core principles

1. One product, one runtime home, one source of configuration truth.
2. The buyer owns the soul, memories, credentials, and shutdown decision.
3. Advanced controls exist, but the default path stays calm and understandable.
4. Optional integrations never block the first conversation.
5. Every important state has a visible health check and a recovery path.
6. Product claims must describe behavior the shipped build actually performs.

## Ten-minute buyer journey

### 1. Start

The buyer extracts the ZIP and runs one Windows launcher. The launcher checks prerequisites and opens the local setup screen.

### 2. Meet the agent

The buyer chooses:

- agent name;
- operator name;
- one-sentence mission;
- optional voice output.

The setup screen previews the resulting identity.

### 3. Connect intelligence

The buyer chooses one of:

- Ollama on this computer;
- supported cloud provider;
- advanced OpenAI-compatible endpoint.

The product shows provider-specific fields, tests the connection, and reports a plain-language result before continuing.

### 4. Initialize the entity

The product validates the portable metadata, creates the private runtime home,
installs the supplied Cognitive Harness without rewriting it, introduces the
selected model through an explicit lifecycle choice, and records content
versions and lineage outside the harness.

### 5. First conversation

The buyer reaches the main conversation screen and sees one clear prompt: “What would you like us to work on first?”

Optional Telegram connection and advanced room management are offered after this success, not before it.

## Required capabilities

### F1 — Guided onboarding

- Runs locally.
- Can be resumed after interruption.
- Never requires editing JSON on the default path.
- Allows optional steps to be skipped.
- Does not display or log a full secret after entry.
- Includes a final readiness test.

### F2 — Unified identity and soul

- `soul.json` remains the portable, shareable blueprint.
- Buyer identity and mission are stored separately from the distributable default.
- The active Cognitive Harness is buyer-owned and is not mechanically rewritten
  by the OS.
- The buyer can inspect the portable metadata, active harness, entity binding,
  and lineage separately.
- Invalid soul files fail with a specific explanation and a restore-default action.
- Any change to harness cognitive architecture follows the Cognitive Harness
  Contract and is reviewed by an intelligence operating through the harness.

### F3 — Model connections

V1 must support:

- Ollama;
- Google/Gemini;
- OpenAI;
- Anthropic;
- OpenRouter;
- advanced OpenAI-compatible base URLs.

Each supported path needs:

- validated required fields;
- a connection test;
- model selection or manual model entry;
- a timeout and useful error message;
- no secret in normal logs.

### F4 — Conversation

- Local web conversation UI.
- Streaming assistant output where supported.
- Stop-generation control.
- New conversation control.
- Persistent session history stored in the runtime home.
- Recovery after UI or model-process restart.
- Clear tool/action activity without dumping raw protocol noise.

### F5 — Memory rooms

- Journal, working context, and long-term memory have distinct visible purposes.
- The buyer can inspect, search, edit, export, and delete stored memory.
- Memory writes identify when and why they were created.
- Product updates do not overwrite buyer memory.
- The agent loads only relevant rooms by default.

### F6 — Voice

- Browser microphone input when supported.
- System/browser speech output toggle.
- Text use remains fully functional when voice is unavailable.
- The UI explains that browser or operating-system speech services may have their own privacy behavior.

### F7 — Telegram

- Optional and disabled by default.
- Token is stored only in the private runtime home.
- Pairing establishes an explicit allowlist.
- Messages from unapproved chats are ignored.
- The UI can disconnect Telegram and delete the stored token.
- Status shows whether the local bridge is running.

### F8 — Heartbeat

- Disabled or conservatively configured until the buyer opts in.
- Shows what will run, how often, and where output goes.
- Supports dry run.
- Never gains a new external destination without buyer action.

### F9 — Data control

- Shows the exact local data directory.
- One-click/open-folder access to inspect data.
- Versioned backup produces a portable archive without secrets by default.
- An explicit option may include secrets only after a warning.
- Restore validates the archive before changing state.
- Reset and uninstall distinguish application files from buyer data.

### F10 — Health and recovery

- System page reports app, schema, runtime, Node, model, harness, memory, voice, Telegram, and heartbeat status.
- Every failed check links to a concrete repair action.
- Logs redact credentials.
- A support bundle excludes secrets and private memory by default.

## Visual direction

The product should feel calm, intelligent, and alive:

- near-black background;
- deep blue-violet structure;
- restrained warm amber for identity and successful connection;
- luminous eye/orb as the agent-presence element;
- large readable typography;
- movement limited to breathing, listening, thinking, and speaking states;
- advanced system details placed behind a deliberate control.

The eye is not decoration alone. Its state should communicate:

- dormant;
- ready;
- listening;
- thinking;
- speaking;
- attention required.

All states must also have text labels and reduced-motion behavior.

## Information architecture

The main product navigation is:

1. Conversation
2. Memory
3. Rooms
4. Connections
5. System

Onboarding is a separate first-run route. Heartbeat belongs under System until the buyer enables it.

## Non-goals for v1

- Multiple simultaneous agents
- Cross-machine mesh orchestration
- A general-purpose coding worker
- Native mobile application
- Hosted account system
- Subscription billing inside the app
- Automatic purchases or social posting
- Claims that alignment guarantees model behavior

## Commercial definition of done

V1 is ready to sell only when:

- a non-technical Windows tester completes first setup without repository knowledge;
- local and cloud model paths each pass;
- identity and soul demonstrably affect the running agent;
- model changes cannot silently impersonate the existing entity;
- memory survives restart and upgrade;
- backup and restore pass with realistic data;
- Telegram rejects an unapproved chat;
- the release ZIP contains no secret or machine-specific state;
- all mandatory release gates pass from a clean extracted ZIP;
- screenshots, quick start, support language, and product-page claims match the shipped experience.
