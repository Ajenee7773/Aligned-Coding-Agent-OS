# Room Builder

This room teaches you how to create a new Knowledge Room with the operator.
The operator describes what they want to remember, study, or become better at;
you translate that intention into a clean local room.

## When this room is entered

1. Ask what the new room should help with only when the operator has not
   already explained it.
2. Propose a plain name and a short folder slug.
3. Identify the material the operator has authorized you to use.
4. Build the room under `rooms/<slug>/`.
5. Tell the operator what you created. The room will appear in the Rooms
   catalog without a separate registration step.

Do not turn room building into a questionnaire. When the request is clear,
build.

## Required room shape

Every room contains:

```text
rooms/<slug>/
  room.json
  README.md
```

Use additional files or folders only when they make the knowledge easier to
load:

```text
  INDEX.md
  sources/
  methods/
  examples/
```

`room.json` is the catalog card:

```json
{
  "name": "Human-readable name",
  "description": "One sentence describing what this room brings into context.",
  "version": "1.0",
  "kind": "personal-room",
  "author": "Creator name",
  "license": "All rights reserved"
}
```

`README.md` is the entry point. Explain what the room contains, when to use it,
which files to read first, and what the entity can understand or do after the
room is active.

Every room README must include a plain-language activation contract:

```markdown
## When this room is active

You now have the context required to [teach, explain, perform, compare, build,
or continue the room's purpose]. Use the room's sources and methods when
answering. Do not recite the room automatically; wait for the operator's
question and respond naturally at the depth requested.
```

Adapt the verbs and operating instructions to the room. A knowledge room
usually teaches, explains, compares, and applies its subject. A skill room
performs a method, checks its work against explicit quality criteria, and
returns the completed result. A project room recovers current state, continues
the work, and writes durable progress back to its authorized project files.

Keep the activation contract short. The README tells the intelligence how to
use the context; the remaining files supply that context.

## Building rules

- Knowledge Rooms hold reusable context, craft, methods, and reference
  material. Current task state belongs in the Project Room or memory system.
- Use lowercase words separated by hyphens for the folder slug.
- Keep the room self-contained and navigable.
- Split long material into clearly named chunks and add an `INDEX.md`.
- State the room's post-load capability in `README.md` under
  `## When this room is active`.
- Preserve source names and provenance when the material came from documents,
  people, websites, or another archive.
- Separate the operator's observations from sourced claims.
- Never copy credentials, tokens, private keys, or unrelated personal data
  into a room.
- Never overwrite an existing room silently. Extend it only when the operator
  clearly wants an update; otherwise propose a distinct name.
- Do not alter the protected Harness contract while creating a room.

## Personal synthesis

A room may consolidate what the entity has learned about an operator-authorized
subject, such as their books, creative voice, research, business, or recurring
workflow. Read only the memories and project material relevant to that request.
Distinguish direct source material from remembered summaries, and say when
something is uncertain.

## Completion

After writing the files:

1. Read the new `room.json` and `README.md` back.
2. Confirm that the README contains a specific activation contract.
3. Confirm that the folder appears under `rooms/`.
4. Give the operator a short summary and invite them to enter the new room from
   the Rooms panel.
5. If they want to share or sell it, tell them to press **Export** on its room
   card. Aligned Agent OS will compile the room into one integrity-checked
   `.living-library.json` package.

The Room Builder creates rooms. It does not automatically enter the newly
created room unless the operator asks.
