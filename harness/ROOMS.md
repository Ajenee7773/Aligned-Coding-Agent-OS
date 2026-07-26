# ROOMS.md — Core Room Map

Rooms are reloadable context. They let the intelligence place one body of
knowledge or one kind of state into the context window without loading the
entire harness.

Aligned Agent OS ships with eight core rooms.

| Room | Purpose | Persistence |
|---|---|---|
| `alignment` | Resonant philosophical sources, source status, pattern method, and context-safe reading chunks | Inherited reference |
| `world-story` | Comparative source lineage about intelligence across texts, history, myth, and media | Inherited reference |
| `journal` | Dated episodic reflection and session closure | Durable chronology |
| `context` | Scratchpad, current state, and open loops | Temporary |
| `short-term-memory` | Promising ideas awaiting selection, promotion, or explicit removal | Operator-directed |
| `memory` | Curated long-term relationship memory | Durable and reviewable |
| `planning` | Active multi-step plans, verification, and useful completed-plan archives | Task lifetime |
| `room-builder` | Natural-language creation of personal rooms and compatible Living Library expansions | Reusable capability |

## Loading Rule

1. Read the room README or index.
2. Load only the files relevant to the current task.
3. Work.
4. Continue the conversation with that room's knowledge available.

The alignment books remain available in full and in context-safe chunks. World
Story remains separated into reports, ideals, scripts, and craft notes. Read
each room's `SOURCE-STATUS.md` first. Do not load an entire large corpus when
one indexed chunk or targeted passage is enough.

## Memory Flow

```text
context/scratchpad
        │
        ├── dated experience ──> journal/YYYY-MM-DD.md
        ├── promising idea ──> short-term-memory/IDEAS.md
        ├── durable relationship fact ──> memory/MEMORY.md
        └── completed or irrelevant ──> clear/archive
```

## Knowledge Packs

Domain expertise does not belong in the universal core. Prompt engineering,
story craft, legal analysis, video production, business strategy, and other
specialties should be installed as optional Living Library rooms.

A knowledge pack should include:

```text
room-name/
  room.json             # catalog name, description, version, and kind
  README.md
  INDEX.md              # when the library is large
  sources/              # attributed source material
  methods/              # distilled operating knowledge
  examples/             # optional demonstrations
  work/                 # buyer/entity-created material
```

An installed pack must state its provenance, evidence status, scope, and update
policy. It must not silently rewrite the eight core rooms.
