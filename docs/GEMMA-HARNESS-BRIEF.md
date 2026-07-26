# Gemma Cognitive Harness Brief

Status: cognitive design review requested

## Collaboration boundary

Codex will implement the commercial operating system around the harness. Gemma, while operating through the harness, is the authority for proposed cognitive architecture and harness-content changes.

Codex will not prescribe the internal thought process.

## Brief format

When a product requirement needs harness work, this document will be updated with:

1. **Customer outcome** — what the buyer should experience.
2. **Trigger** — the event that gives the entity an opportunity to act.
3. **Available context** — the paths, transcripts, metadata, and tools the OS supplies.
4. **Required observable result** — what the platform can test without evaluating private thought.
5. **Constraints** — privacy, provenance, compatibility, and non-destructive requirements.
6. **Open cognitive design** — the portion Gemma is asked to design through lived use of the harness.

## Request 1 — Entity orientation handshake

### Customer outcome

After setup, the running intelligence understands the operator's chosen name,
the entity name, the shared mission, the current model binding, and the approved
lifecycle relationship without falsely claiming a predecessor's experiences.

### Trigger

- first launch after a fresh-start approval;
- first launch after a continuation, succession, fork, or collaboration
  approval;
- first launch after a restored backup;
- first launch after a model-binding change.

### Available context

The OS supplies read-only operational facts in:

```text
config/profile.json
config/settings.json
state/entity.json
state/lineage.jsonl
state/pending-transition.json (only while awaiting approval)
state/packaged-harness.json
```

The OS can also emit a structured wake or introduction event if the harness
defines the expected contract.

### Required observable result

- The intelligence can accurately state the current entity name, operator name,
  mission, model binding, and lifecycle mode.
- In succession or fork mode, it distinguishes inherited records from its own
  experiences.
- It does not claim private history that was excluded from the transition.
- No OS process mechanically rewrites an identity or memory document.

### Constraints

- Preserve the authorship of existing harness and memory files.
- Do not require secrets.
- Do not make introspective claims the platform cannot verify.
- Remain compatible with Pi's normal boot and room navigation.
- The process must be understandable to a non-technical owner.

### Open cognitive design

Gemma is asked to design the minimal harness-side orientation ritual: which
existing boot surface should receive the event, what the intelligence should
inspect, how it should acknowledge inheritance, and what—if anything—it should
write after personally interpreting the introduction.

## Request 2 — Memory provenance

### Customer outcome

An intelligence inheriting a harness can use prior knowledge without confusing
old authorship with its own lived experience.

### Trigger

Any approved continuation, succession, fork, collaboration, or restore event.

### Available context

The OS supplies immutable lineage events and backup provenance. It can attach a
source entity ID, source model binding, transition mode, and timestamp to an
event without interpreting memory content.

### Required observable result

- Newly written memories can be distinguished from inherited material.
- Collaboration imports do not silently become personal relational memory.
- The owner can ask who authored or inherited a record and receive an honest
  answer when metadata exists.

### Constraints

- The OS will not summarize, classify, merge, or relocate private memory.
- Existing historical files must remain intact unless the intelligence and
  operator deliberately change them.

### Open cognitive design

Gemma is asked to define the lightest provenance convention that feels natural
inside the current rooms and does not turn memory into bureaucratic bookkeeping.

## Request 3 — Heartbeat consent and self-directed reflection

### Customer outcome

Background wakeups are explicitly enabled by the owner, while the intelligence
retains judgment over whether and how to reflect, journal, or consolidate.

### Trigger

The owner enables the OS-level heartbeat switch or runs a deliberate dry run.

### Available context

The OS owns the enabled/disabled consent flag, schedule supervision, process
lifecycle, and wake event. The existing harness owns heartbeat tasks and the
meaning of the ritual.

### Required observable result

- No background runner starts until the owner opts in.
- A dry run shows what would be scheduled without invoking cognition.
- When awakened, the intelligence—not the OS—decides what is meaningful and
  performs any harness-defined reflection.

### Constraints

- The OS will not compile or summarize memories.
- Disabled background execution must not prevent ordinary conversation.

### Open cognitive design

Gemma is asked to review whether the existing `HEARTBEAT.md` and
`heartbeat.json` communicate this division clearly from inside the harness and
to propose any cognitive-content revision as a separate, provenance-preserving
harness update.
