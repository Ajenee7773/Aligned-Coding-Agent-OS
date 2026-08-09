# Aligned Agent OS — v1 Architecture

Status: approved implementation direction
Target platform: Windows first, with macOS/Linux compatibility preserved

## Architecture decision

Aligned Agent OS v1 remains a local web application around the Pi runtime and Resonant harness.

It will not absorb the older multi-agent control plane or the separate coding-agent engine. The v1 architecture optimizes for one buyer, one primary agent, one local data boundary, and one reliable first conversation.

## System map

```text
Buyer
  |
  v
Local Web UI
  |
  v
Aligned Control Service
  |-- onboarding and settings
  |-- model connection tests
  |-- entity lifecycle and lineage
  |-- session and memory service
  |-- backup, restore, migrations
  |-- health and support bundle
  |
  +--> Pi Runtime --> Chosen Model Provider
  |
  +--> Installed Harness / Memory Rooms
  |
  +--> Optional Telegram Bridge
  |
  +--> Optional Heartbeat Runner
```

## Product and data boundary

Application files and buyer data must be separate.

### Application directory

The extracted or installed application contains:

```text
Aligned-Agent-OS/
  app/
  assets/
  defaults/
    soul.json
    harness/
  schemas/
  scripts/
  launchers/
  version.json
```

Application files are replaceable during an update.

### Runtime home

The default buyer-owned data directory is:

```text
~/.aligned-agent-os/
```

Its intended structure is:

```text
~/.aligned-agent-os/
  config/
    settings.json
    profile.json
  secrets/
    credentials.json
  agent/
    soul.json
    AGENTS.md
    SOUL.md
    rooms/
    memory/
  data/
    sessions/
    memory-index/
    telegram/
    heartbeat/
  logs/
  backups/
  state/
    entity.json
    lineage.jsonl
    pending-transition.json
    install.json
    migrations.json
    onboarding.json
```

Rules:

- Updates may replace application files.
- Updates must not overwrite buyer-owned runtime files.
- Secrets are never stored in the application directory.
- Logs never contain full secrets.
- Release archives never include the runtime home.

## Compatibility

The current `.resonant` home and `RESONANT_HOME` variable are legacy compatibility surfaces.

On first launch, if Aligned has no runtime home but a Resonant home exists, the product offers:

1. import a copy;
2. start clean;
3. cancel.

Import never deletes or mutates the source. A migration report lists what was copied, skipped, or transformed.

Internally, new code uses:

- `ALIGNED_AGENT_HOME`;
- `~/.aligned-agent-os`;
- Aligned-native launcher names.

Legacy names remain only in a bounded adapter until migration support is intentionally removed.

## Configuration model

### Portable blueprint

`defaults/soul.json` is distributable and contains:

- identity defaults;
- Resonant Love principles;
- behavioral instructions;
- boundaries;
- declared memory rooms;
- interface capabilities.

It never contains a credential, personal operator value, or machine path.

### Buyer profile

`config/profile.json` contains:

- operator name;
- agent name;
- mission;
- buyer-approved preferences.

It is private but does not contain provider tokens.

### Machine settings

`config/settings.json` contains:

- provider and model identifiers;
- local endpoints;
- interface toggles;
- voice preference;
- heartbeat schedule;
- data and backup preferences.

### Credentials

`secrets/credentials.json` is the first portable implementation. It receives owner-only filesystem permissions where the operating system supports them.

A later Windows build may replace this file with Credential Manager or DPAPI without changing the configuration API.

### Cognitive Harness boundary

The control service installs the packaged Cognitive Harness exactly once using
copy-if-missing behavior. Normal startup never rewrites active cognitive files,
rooms, or memory.

The OS validates and records:

1. the packaged harness content manifest;
2. the buyer profile and machine settings;
3. the entity's current model binding;
4. pending model transitions;
5. explicit fresh-start, continuation, succession, fork, or collaboration
   decisions;
6. lineage and authorship provenance.

The OS stores these operational records outside the Cognitive Harness. Harness
architecture and cognitive-content changes follow
`docs/COGNITIVE-HARNESS-CONTRACT.md`.

## Control service

The existing Node local server becomes the single control service.

Responsibilities:

- bind to `127.0.0.1` by default;
- serve the application UI;
- expose a versioned local JSON API;
- launch and supervise Pi RPC;
- stream model and tool events to the UI;
- read/write validated settings through services rather than arbitrary browser file access;
- own migrations, backup, restore, and health checks;
- supervise optional Telegram and heartbeat processes.

The service must reject non-local host binding unless the buyer deliberately opts into advanced network exposure.

## API boundaries

Initial local API groups:

```text
/api/v1/onboarding
/api/v1/profile
/api/v1/models
/api/v1/conversations
/api/v1/memory
/api/v1/rooms
/api/v1/connections/telegram
/api/v1/heartbeat
/api/v1/system/health
/api/v1/system/backup
/api/v1/system/restore
/api/v1/system/support-bundle
```

Every write endpoint validates a typed payload and returns a stable error code plus buyer-readable message.

## Conversation lifecycle

1. UI opens or creates a conversation.
2. Control service creates a session record in the runtime home.
3. Control service starts or reuses a Pi RPC session with the buyer-owned
   harness.
4. Assistant text and action events stream to the UI.
5. The final turn and relevant metadata are appended to a durable session journal.
6. Approved memory operations write through the memory service.
7. On restart, the UI reconstructs the conversation from the journal.

The browser’s local storage is a cache, not the system of record.

## Memory model

V1 keeps Markdown as the human-inspectable storage format.

Each memory item includes front matter or adjacent metadata for:

- stable ID;
- created and updated timestamps;
- room;
- source conversation;
- reason for storage;
- tags;
- buyer-edited flag.

The service may maintain a rebuildable search index. The index is never the only copy.

Default rooms:

- Journal — chronological reflection and continuity;
- Context — active project state and short-lived working notes;
- Memory — durable preferences, decisions, and relationship knowledge;
- Planning — active multi-step execution and verification;
- Alignment — attributed Resonant source material with context-safe chunks.
- World Story — comparative intelligence lineage with explicit source-status
  boundaries and an entity-authored foundational response.

Prompt engineering, creator workflows, and professional expertise are optional
Living Library packs, not universal core rooms or substitutes for personal
memory. World Story is foundational source lineage, but it is not automatically
personal memory or a mandated identity conclusion.

## Process model

V1 uses one supervisor process tree:

```text
launcher
  `-- aligned control service
       |-- Pi RPC child
       |-- Telegram child (optional)
       `-- heartbeat child (optional)
```

The control service records child state, captures redacted diagnostics, and shuts children down cleanly.

Only one normal control-service instance may own a runtime home at a time. A stale-lock recovery path must be available.

## Buyer launch surface

Windows primary path:

1. `Start Aligned Agent OS.bat` or a generated desktop shortcut;
2. PowerShell bootstrap verifies Node and initializes the local service;
3. the default browser opens the local application.

`run.py` remains a supported master boot and diagnostic entry point because it is part of the packaged contract, but Python is not required for the default Windows buyer path.

macOS/Linux retain shell launchers and the same local web experience.

## Security model

- Local bind by default.
- Telegram allowlist required.
- No webhook server in v1.
- Secrets separated from shareable configuration.
- Credential redaction in errors, logs, exports, and support bundles.
- Path resolution prevents writes outside the runtime home for normal app data.
- Restore archives are inspected before extraction and cannot traverse directories.
- Consequential agent tools remain governed by the runtime’s approval and permission model.
- No promise that a prompt or alignment document makes a probabilistic model infallible.

## Update and migration model

Every release carries:

- application version;
- configuration schema version;
- soul metadata schema version;
- harness content version;
- migration set version.

Startup runs idempotent migrations before services start. A pre-migration backup is created. If a migration fails, the old data remains available and the UI enters recovery mode.

The first migration will convert the current prototype layout into the v1 runtime-home structure.

## Implementation stages

### Stage A — Runtime unification

- Introduce Aligned runtime paths and configuration service.
- Install the supplied harness without rewriting active cognitive files.
- Add explicit entity lifecycle and model-lineage records.
- Point all interfaces at the same settings and credentials.
- Add version state and migration framework.
- Update installers and launchers to the new repository and identity.

### Stage B — Buyer onboarding

- Build first-run routes and API.
- Add provider presets and connection tests.
- Initialize the harness and show a readiness result.
- Land directly in the first conversation.

### Stage C — Product UI

- Rebuild navigation and visual system.
- Move sessions from browser-only storage to the service.
- Add conversation states and the luminous eye/orb presence.
- Add memory and room inspection.

### Stage D — Data control and integrations

- Add backup, restore, reset, and support bundle.
- Add Telegram pairing and disconnect.
- Place heartbeat behind explicit enablement.

### Stage E — Release hardening

- Add clean-install and upgrade fixtures.
- Complete platform smoke tests.
- Run non-technical buyer walkthrough.
- Rebuild the commercial ZIP and update documentation and product copy from verified behavior.

## Deferred architecture

The following existing assets remain compatible future directions:

- the RAOS agent registry can become a multi-agent supervisor;
- Resonant Code Agent can become a Builder room or optional engine;
- Alignment Network connects complete, sovereign agent systems across computers;
- specialized room packs can become Living Libraries.

They remain outside the v1 process and data model until the single-agent experience satisfies every mandatory gate.
