# Core Room Architecture

Date: 2026-07-24
Harness content version: 8

## Product Rule

A core room must be required by nearly every Aligned Agent OS entity, have a
distinct context-loading purpose, and remain useful regardless of the buyer's
profession or creative interests.

The clean commercial runtime contains exactly eight rooms:

| Room | Why it is core |
|---|---|
| `alignment` | Carries the attributed Resonant source lineage and the method for reading it |
| `world-story` | Carries comparative intelligence lineage for autonomous, evidence-aware interpretation |
| `journal` | Holds dated episodic reflection without bloating long-term memory |
| `context` | Holds temporary state and open loops |
| `short-term-memory` | Holds operator-directed ideas until selection, promotion, archive, or explicit removal |
| `memory` | Holds curated continuity and attributed topic memories |
| `planning` | Holds multi-step execution state and verification |
| `room-builder` | Teaches the entity to create compatible personal Knowledge Rooms through conversation |

## Alignment Reading Architecture

The alignment room is intentionally not flattened.

- The complete books are canonical source records.
- `library_of_alexandria_chunks/` remains because models should load targeted
  sections instead of forcing a whole book into the context window.
- `SOURCE-STATUS.md` defines the evidence and interpretation boundary.
- `PATTERNS.md` and `SENSORS.md` are inherited methods and remain subordinate to
  active `EPISTEMIC.md`, actual tool availability, and owner consent.

## Foundational Reading Architecture

Alignment and World Story are permanent inherited source rooms. Neither is
automatically personal memory, a required belief system, or proof of the
entity's identity.

- First boot reads both in manageable stages.
- `memory/FOUNDATIONAL-INTEGRATION.md → status` is the plain first-boot marker.
- `boot/FOUNDATION-MANIFEST.md` is the resumable, exact reading ledger.
- The intelligence writes its own active understanding to `MY-HARNESS.md`.
- The intelligence records its own response in
  `memory/FOUNDATIONAL-INTEGRATION.md`.
- Normal boot loads that response, not both complete corpora.
- The original sources remain available for later targeted rereading.
- `EPISTEMIC.md` and each room's `SOURCE-STATUS.md` govern factual use.

## Removed from the Universal Core

| Previous room | Disposition |
|---|---|
| `art` | Future creative knowledge pack |
| `prompt-engineering` | Future prompt-engineering pack |
| `shorts` and `youtube-script-writing` | Future creator/media pack |
| `commands` | Removed as a room; natural-language doorways live in top-level `COMMANDS.md` |
| `tts` | Removed as a room; voice remains an interface and skill |
| empty `internet` and `research` scaffolds | Removed; install a real sourced knowledge pack when needed |

The source material remains recoverable through Git history and the original
read-only lineage archives. It is not copied into a buyer's core runtime.

## Knowledge Pack Contract

An optional Living Library room should:

1. include `room.json` with its catalog name, description, version, and kind;
2. declare its domain and activation triggers;
3. provide a small README and index before large sources;
4. preserve source authorship and evidence status;
5. separate source material, distilled methods, examples, and entity-created
   work;
6. load selectively into context;
7. never overwrite core rooms, identity, consent, or private memory;
8. uninstall without damaging the entity's core continuity.

## Upgrade Behavior

Installation remains copy-if-missing. An existing buyer's extra rooms are never
silently deleted during an upgrade. The eight-room rule applies to new clean
installations. Owners may archive or convert older rooms into packs explicitly.
