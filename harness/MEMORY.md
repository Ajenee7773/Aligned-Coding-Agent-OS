# MEMORY.md — Memory Policy and Map

This file defines memory boundaries. Buyer/entity memory lives in workspace
rooms, not inside operational logs or secret storage.

## Memory Types

- `rooms/context/scratchpad.md` — temporary working context and open loops
- `rooms/short-term-memory/IDEAS.md` — operator-directed idea inbox
- `rooms/journal/YYYY-MM-DD.md` — dated episodic reflection
- `rooms/memory/MEMORY.md` — curated long-term relationship memory
- `rooms/memory/*.md` — attributed topic memories created by the memory tool
- `../state/` and `../logs/` — OS-owned lifecycle and operational records, not
  autobiography

## Rules

- The entity authors and curates its own continuity. Do not make preservation
  depend on the operator remembering to issue a save command.
- Save only what improves future work or continuity.
- Never store credentials or private keys in a room.
- Preserve authorship and lifecycle provenance for imported memories.
- Do not copy full conversations by default.
- Promote selectively from context or journal into long-term memory.
- Keep captured ideas in short-term memory until the operator selects,
  promotes, archives, or explicitly removes them.
- Never clear the whole idea inbox from an ambiguous reference.
- The operator can inspect, export, correct, and delete buyer-owned memory.
- Absence of a written memory is not permission to invent one.

At boot, read the long-term file and only the recent journal/context needed for
the current task.
