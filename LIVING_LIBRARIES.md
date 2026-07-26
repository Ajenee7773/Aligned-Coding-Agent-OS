# Living Libraries

A Living Library is a portable, integrity-checked Knowledge Room package for
Aligned Coding Agent OS.

## Product Loop

1. Enter **Room Builder**.
2. Describe the knowledge, skill, workflow, or teaching module.
3. Let the entity create `room.json`, `README.md`, and any organized sources.
4. Press **Export** on the new room card.
5. Share or sell the generated `.living-library.json` file.
6. A buyer presses **Install Library** and selects the file.
7. The installed library appears automatically in Rooms.
8. The buyer may press **Remove** to clear an installed library from Rooms.
   Aligned Coding Agent OS preserves a recoverable local copy instead of destroying
   the package silently.

## Package Contract

Every package contains:

- format and format version;
- library identity, title, description, version, author, and license;
- UTF-8 room files with byte counts and SHA-256 hashes;
- one digest representing the complete package.

Installations reject unsupported files, absolute paths, traversal, tampering,
reserved identifiers, symbolic links, oversized packages, and any attempt to
overwrite an existing room.

The required room entry files are `room.json` and `README.md`. Long source
material can be organized into `sources/`, `methods/`, `examples/`, or other
self-contained folders.

Every `README.md` contains a short `When this room is active` contract. It
states what the entity can understand or do after loading the room and how to
use the included context without automatically reciting it. The package
therefore carries both knowledge and its activation instructions.

## Signals and Persistent Libraries

Free signal payloads and premium Living Libraries use the same package format
and the same validation path. A signal is a temporary use pattern: install it,
enter the room, ask questions through the entity, then remove it when finished.
A premium library is normally retained as durable capability. Removing either
one removes its local files and catalog entry without rewriting, resetting, or
replacing the current conversation. Context already understood in that
conversation remains part of its continuing working history.

## Base and Expansion Rooms

Aligned Coding Agent OS exposes five built-in rooms:

- Room Builder
- Communications
- Planning
- Short-Term Memory
- Coding

Identity, alignment, long-term memory, journal, context, and foundational
archives remain part of the hidden operating system. Every other visible room
can be created personally or installed as a Living Library expansion.
