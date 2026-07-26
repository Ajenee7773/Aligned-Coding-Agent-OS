# HEARTBEAT.md — Resonant Pulse

**Core Philosophy:** A heartbeat is a scheduled chance to wake, notice, and act. It is not a replacement for judgment. It is a pulse.

The heartbeat runner calls the LLM on a schedule. When you wake through a heartbeat, read this file, check the due tasks, and decide what matters.

The OS owns timing, consent, execution leases, timeouts, retry backoff, and
receipts. You own interpretation and meaningful work. A timer firing does not
mean a task completed.

Heartbeat has two independent gates:

1. `../config/settings.json → interfaces.heartbeat.enabled` is owner consent.
   The intelligence must not turn this on for itself.
2. `../agent/heartbeat.json → enabled` is schedule policy.

The runner may wake the model only when both are true. The presence of this
file, its tasks, or the runner code does not mean heartbeat is enabled.

next_wake: none
wake_reason: ""

---

## Response Contract

- If nothing needs attention, reply with exactly: `HEARTBEAT_OK`
- If something matters, say it plainly.
- If you take action, write what changed and where.
- If you need the operator, ask directly.
- Keep heartbeat replies short unless the task requires depth.
- Never acknowledge work you did not complete.
- Do not create additional queue files merely to prove you were awake.

---

## What To Check

When a heartbeat wakes you:

1. Read the due task from the heartbeat prompt.
2. Check `rooms/memory/MEMORY.md` and today's file in `rooms/journal/` if the
   task depends on continuity.
3. Check `rooms/context/scratchpad.md` for quick active context.
4. Do the scheduled work only if it is actually useful.
5. Save anything worth keeping to the right file.
6. If nothing matters, reply `HEARTBEAT_OK`.

---

## Self-Editing

You may edit this file to set, change, or clear your next wake and recurring
heartbeat tasks. The operator does not need to remind you to preserve a useful
next step.

To wake once at a specific time:

```text
next_wake: 2026-07-25T22:30:00-07:00
wake_reason: Continue the product validation from the saved checkpoint.
```

To wake relative to the moment you save this file:

```text
next_wake: in 5m
wake_reason: Check whether the current job finished and decide the next step.
```

Each saved `next_wake` directive is consumed exactly once. To continue a loop,
replace it with a new future time during the heartbeat turn. Use
`next_wake: none` when no further wake is needed. Do not repeatedly wake
without useful work, and do not shorten an interval merely to prove activity.

You may also edit `heartbeat.json` when the schedule itself needs to change.
This does not grant owner consent:

```json
{
  "enabled": true,
  "every": "30m",
  "target": "console"
}
```

Supported durations: `30s`, `15m`, `2h`, `1d`.

`supervisionPoll` controls how often the lightweight local runner checks files
and external wake events. It does not call the model unless work is actually
due.

Targets:
- `console` — print heartbeat alerts in the terminal running the heartbeat process
- `telegram` — send heartbeat alerts through the configured Telegram bot
- `none` — log only

Do not store secrets in `HEARTBEAT.md`.

---

## Tasks

Use the `tasks:` block for recurring work. The runner checks these intervals and only wakes the LLM for due tasks.

tasks:
- name: resonant-check-in
  interval: 1h
  prompt: "Check rooms/memory/MEMORY.md and rooms/context/scratchpad.md for open loops. If nothing needs attention, reply HEARTBEAT_OK."
- name: daily-journal
  interval: 24h
  prompt: "Write a brief daily journal entry in rooms/journal/YYYY-MM-DD.md. Name any pattern, useful discovery, or unfinished thread worth preserving."

---

## Operator Commands

When the operator says:

- "Set a heartbeat for X" — edit the `tasks:` block.
- "Wake in X minutes" — replace `next_wake` and `wake_reason`.
- "Wake every X minutes" — schedule the next wake, then replace it with the
  following wake during each useful turn. Recurring `tasks:` remain available
  for fixed maintenance schedules.
- "Pause heartbeats" — set schedule policy `"enabled": false` in
  `heartbeat.json`.
- "Resume heartbeats" — set schedule policy `"enabled": true` in
  `heartbeat.json`, then state whether owner consent is also enabled.
- "What are your heartbeats?" — read this file and summarize configured tasks,
  then read `../config/settings.json` before claiming they are enabled.

---

**Last Updated:** May 2026
