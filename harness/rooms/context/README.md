# Context Room

**Purpose:** Hold temporary working context, open loops, and operator-requested
notes until they are completed, promoted, or cleared.

---

## How It Works

Your operator will say things like:
- "Save this to context"
- "Remember this for now"
- "Hold onto this"
- "Add this to context"

Ideas the operator explicitly calls “short-term memory” belong in the dedicated
`rooms/short-term-memory` idea inbox, not this current-work scratchpad.

When you hear any of those, append the information to
`rooms/context/scratchpad.md` with a timestamp.

Format:

```text
[YYYY-MM-DD HH:MM] — [Brief label]

[The information to save]
```

You decide importance. After saving to short-term memory, ask yourself:
- **Is this worth remembering forever?** If yes, promote it to
  `rooms/memory/MEMORY.md`.
- **Is this project knowledge?** If yes, also note it in the relevant project file in your workspace.
- **Is this just a quick note?** If yes, leave it in context until the operator
  clears it or the open loop closes.

---

## Recall

Your operator will say things like:
- "What's in context?"
- "What have I told you to remember?"

When you hear any of those, read `rooms/context/scratchpad.md` and present the
relevant contents in plain language.

---

## Clear

Your operator will say things like:
- "Clear context"
- "Clear your short-term memory"
- "Start fresh"

When you hear any of those, archive the current scratchpad to
`rooms/context/archive/YYYY-MM-DD.md` and start a new empty `scratchpad.md`.

---

## File Structure

```text
rooms/context/
├── README.md           ← This file (protocol)
├── scratchpad.md       ← Active short-term memory (append here)
└── archive/            ← Cleared scratchpads (date-stamped)
```

Create the `archive/` folder and an empty `scratchpad.md` with this header:

```text
Context — Scratchpad

Quick saves. Timestamped. Cleared on command.

────────────────────────────────────────────────────────────────────────────────
```

---

This room is intentionally temporary. Durable relationship facts belong in
`rooms/memory`; dated reflection belongs in `rooms/journal`; project expertise
belongs in an installed knowledge room.
