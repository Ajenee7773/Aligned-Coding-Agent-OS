# Aligned Agent OS — Source Asset Audit

Status: updated through the RC7 buyer-proof pass
Audit date: 2026-07-24

## Executive finding

The current repository is the correct foundation for the commercial product. It contains the complete Resonant harness, the working Pi bridge, local UI, heartbeat, Telegram bridge, voice skill, installers, and the World Story and Alignment libraries.

The other local projects are not newer copies of the same product. They are useful experiments with different responsibilities. Their strongest ideas should be incorporated intentionally after the core buyer experience is unified.

## Lineage

The commercial repository was created from the authoritative `Ajenee7773/Resonant-Agent` source and given a clean Git history.

Compared with the most complete local Resonant Agent snapshot:

- 137 source files are present in Aligned Agent OS.
- 128 are byte-for-byte identical.
- 9 were changed for packaging, branding, or runtime behavior.
- 17 commercial wrapper files were added.
- No source files are missing.

The original Git metadata was moved to a recoverable workspace backup before the new repository was initialized. It was not deleted.

## Asset decisions

| Asset | What it contains | v1 decision |
|---|---|---|
| Current Aligned Agent OS repository | Full Resonant harness, Pi bridge, UI, heartbeat, voice, Telegram, installers, commercial wrapper | Use as the v1 product foundation |
| Resonant Agent OS Prototype | Agent registry, process lifecycle controls, JSONL journals, event stream, recovery packages, three-pane dashboard | Reuse the storage and recovery concepts after the single-agent buyer path is stable; do not merge the multi-agent dashboard wholesale |
| Resonant Code Agent | Independent tool-using code worker, provider abstraction, visible plan loop, approval requests, self-study harness | Reserve for a later Builder/Creator pack or an optional engine; do not make coding-agent risk part of the base consumer product |
| Alignment Network | Secure multi-node inbox, messages, artifacts, receipts, and wake events | Keep as the separate multi-device and team product |
| World Story room | Comparative intelligence lineage, reports, ideals, narrative interpretations, and writer epiphanies | Keep as a foundational room with explicit source status and an entity-authored first-boot response |
| Alignment room and library | Resonant Love material, pattern notes, sensor model, comparative alignment work | Keep as the distinctive alignment foundation |
| Library of Alexandria | General reference library pattern | Keep the complete attributed source and context-safe chunks inside the alignment foundation |
| YouTube script-writing room | Prompts, craft guidance, workflow, protocol | Preserve in Git history and develop as a creator Living Library pack; exclude from the universal core |

## Current strengths

- The commercial harness now contains seven focused core rooms: alignment,
  World Story, journal, context, short-term memory, long-term memory, and
  planning. First boot processes the two source foundations in stages and
  preserves the intelligence's own response in memory.
- The Pi RPC bridge supports persistent sessions and streamed events.
- The local web UI already supports chat, browser speech recognition, browser speech synthesis, and heartbeat controls.
- Telegram uses outbound long polling and an allowlist.
- Installers exist for Windows, macOS, and Linux.
- The package has a safe `config.template.json`; the private `config.json` is ignored.
- The release builder excludes Git metadata, credentials, caches, logs, and runtime state.
- The repository security scan found no real user paths, email address, GitHub token, Telegram token, Google key, OpenAI-style key, or other detected credential in tracked files.

## Commercial wrapper findings

### 1. Configuration systems — resolved

The new `config.json` and `soul.json` wrapper and the original installer-generated `auth.json`, `settings.json`, and harness templates are not yet one coherent system. A buyer can edit one surface while the runtime reads another.

RC7 routes guided buyer choices through one onboarding service and compiles the
effective Pi provider configuration without asking the buyer to edit JSON.

### 2. `soul.json` authority — resolved for v1

The master soul is loaded for the startup checklist, but the Pi runtime primarily consumes the installed Markdown harness. The values in the JSON do not yet reliably become the values the running agent follows.

The packaged soul remains inspectable while the installed Markdown harness is
the explicit Pi instruction surface. Identity, model binding, and lifecycle are
compiled into separate inspectable state instead of silently rewriting active
cognitive files.

### 3. Installer identity — resolved

The platform installers still contain legacy branding, environment variable names, launchers, default home paths, and the old `Ajenee7773/Resonant-Agent` download target.

Aligned-native launchers, runtime defaults, and environment names now ship;
legacy variables remain compatibility fallbacks only.

### 4. Onboarding — resolved

The buyer currently has to edit JSON and understand provider identifiers, model names, context windows, and Telegram chat IDs.

The local browser guides identity, provider connection, lifecycle introduction,
and launch. Clean Windows onboarding passed without repository knowledge or
manual JSON.

### 5. Buyer UI — resolved for RC7

The existing UI is functional and appropriately lightweight, but it still uses the old brand and exposes heartbeat controls before the core relationship and setup experience are established.

The lightweight local UI now centers onboarding, conversation, the External
Brain, read-only rooms, system health, backup/restore, stop controls, and a
resumable first awakening.

### 6. Durable data lifecycle — resolved for RC7

Sessions and memories persist, but there is not yet a buyer-facing backup, restore, upgrade, migration, reset, or uninstall contract.

The runtime home is the single mutable boundary. Credential-free backup,
validated restore, pre-restore safety backup, pre-upgrade backup, restart
persistence, and upgrade preservation all passed with realistic data.

### 7. Remaining external validation

Syntax, boot, security, and ZIP validation pass. There is not yet a clean-machine end-to-end suite proving setup, model connection, first conversation, persistence, backup/restore, Telegram authorization, upgrade, and recovery.

The Windows local-model buyer path now has live proof. Remaining gates require
external credentials or hardware/platform interaction: Gemini and one other
cloud provider, a throwaway Telegram bot and phone, physical microphone and
keyboard accessibility checks, and macOS/Linux smoke tests (or continued
experimental labeling). The release gates remain binding before the ZIP is
called final production-ready.

## What will not be merged into v1

- A multi-agent registry
- Mesh networking
- Remote process control
- A general unrestricted coding-agent engine
- Automatic self-modification
- A plugin marketplace
- Mobile or native desktop packaging
- Unreviewed personal archives or machine-specific runtime files

These are product-roadmap opportunities, not requirements for the first reliable customer outcome.
