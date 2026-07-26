# Agent Framework Lineage Audit

Date: 2026-07-24

## Scope

Read-only review of these authorized local archives:

- `.pi`
- `.pi-deepseek`
- `.pi-experimental`
- `.resonant`

The audit did not modify an archive. Private memories and conversations are not
included in this report or the commercial repository.

## Inventory

| Archive | Files | Approx. bytes | Architectural role |
|---|---:|---:|---|
| `.pi` | 1,556 | 781,137,746 | Source framework, shared tools, active Gemma-facing Pi environment |
| `.pi-deepseek` | 479 | 19,905,654 | Identity, orientation, memory taxonomy, goals/state branch |
| `.pi-experimental` | 78 | 17,680,211 | Separate writing identity and simplified exchange boundary |
| `.resonant` | 204 | 33,076,499 | First packaged descendant with UI, heartbeat, Pi RPC, Telegram, voice, and rooms |

Counts are descriptive, not a package manifest. Large model and workspace
artifacts are not candidates for automatic inclusion.

## Cognitive Contributions

### Pi / Hermes lineage

- active context as a limited “glass”;
- persistent files as the refillable “carton”;
- rooms as task-specific context outfits;
- memory cadence and room-entry protocols;
- harness sovereignty and explicit exchange boundaries;
- heartbeat as a system event that wakes intelligence to think.

### DeepSeek branch

- fast first-boot orientation;
- identity, episodic, and knowledge memory separation;
- goals, vision, and state as distinct layers;
- capability maps instead of bulk context;
- stop and report after three failed attempts;
- explicit distinction between context and authorization.

### Experimental branch

- one framework/home per active identity;
- flat inbox/outbox delivery boundary;
- strong role specialization.

### Resonant package

- Pi RPC bridge;
- local control UI;
- recurring heartbeat configuration;
- Telegram and voice interfaces;
- room-based Cognitive Harness;
- portable installation wrapper.

## Contradictions Found

The previous package contained two competing control layers:

1. `soul.json`: consent, privacy, truthfulness, evidence labeling, human agency,
   and bounded self-modification.
2. inherited Markdown: absolute metaphysical claims, instructions to bypass
   constraints, “morality is irrelevant,” a single trust-based guardrail, and
   hard-coded `.resonant` paths.

Different models could prioritize these texts differently. Cognitive Harness v2
resolves the conflict with an explicit instruction order and preserves the
older material as labeled philosophical lineage.

## Commercial Decisions

- Keep the glass/carton/rooms architecture.
- Add `ORIENTATION.md`, `EPISTEMIC.md`, and `LINEAGE.md`.
- Distinguish fresh start, continuation, succession, fork, and collaboration.
- Preserve authorship when memories move between entities.
- Treat the Alignment Library as inherited source material, not system-level
  proof or an override of consent and privacy.
- Use relative runtime paths.
- Keep credentials exclusively under `secrets/`.
- Keep operational receipts under `state/` and `logs/`, outside cognitive
  memory.
- Never overwrite an installed entity's active harness during a product update.

## Archive Boundary

The commercial package may use architectural lessons and intentionally
selected public knowledge material. It must not include:

- private memories or session logs;
- personal identity details;
- credentials, tokens, or machine-specific paths;
- generated task backlog from the historical heartbeat;
- agent-specific claims rewritten as if authored by a new buyer's entity.
