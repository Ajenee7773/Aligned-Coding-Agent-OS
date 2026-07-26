# Heartbeat Supervision

## Historical Failure

The original Pi system had a nightly generator and a separate consumer.

Observed on 2026-07-24:

- `PiNightlyReview` existed and continued creating one task per night.
- `PiHeartbeat` and `PiHeartbeatStartup` did not exist.
- heartbeat status had not advanced since 2026-04-23.
- only two task files were in `completed/`;
- roughly seventy nightly task files remained pending.

The scheduler was alive, but nothing supervised model execution.

## Aligned Contract

A heartbeat run now requires:

1. explicit owner enablement in machine settings;
2. due work in `HEARTBEAT.md`;
3. an available Pi runtime and configured model;
4. a single exclusive execution lease;
5. a model completion within the configured timeout;
6. a non-empty model response;
7. a durable success or failure receipt.

The intelligence can author a one-shot `next_wake` and `wake_reason` directly
in `agent/HEARTBEAT.md`. The supervisor checks that directive and the durable
external wake-event queue every five seconds without calling the model. A
specific directive or external event is consumed only after a successful,
non-empty model turn. A rewritten future directive creates the next pulse.

## State

Operational state lives outside the Cognitive Harness:

- `state/heartbeat.json`
- `state/heartbeat-runner.lock`
- `state/heartbeat-execution.lock`
- `state/heartbeat-wake-events.jsonl`
- `logs/heartbeat.log`
- `logs/heartbeat-events.jsonl`

Task state records attempts, last success, last failure, consecutive failures,
retry time, and run id. A failed run waits for retry backoff instead of
generating duplicate queue files.

External systems can append bounded wake events through the local
`POST /api/heartbeat/wake` endpoint. Owner consent, active hours, the execution
lease, timeouts, and backoff still apply. Events survive restarts and are never
marked complete without a successful model receipt.

## Validation

Automated coverage verifies:

- strict duration and response parsing;
- empty response is failure;
- Pi RPC timeout rejection;
- retry backoff;
- durable successful receipt;
- durable failed receipt.

Real local validation used Pi 0.69.0 and the existing llama.cpp
OpenAI-compatible Gemma endpoint at `127.0.0.1:55401`.

Result:

- provider loaded from the generated Pi configuration;
- Gemma completed both due tasks;
- a journal entry was written to the canonical room (RC2:
  `workspace/rooms/memory/YYYY-MM-DD.md`; RC4 six-room validation:
  `workspace/rooms/journal/YYYY-MM-DD.md`);
- the final run receipt recorded success and the exact `HEARTBEAT_OK`
  acknowledgment;
- the immediate second scheduler check returned `no-tasks-due`;
- no duplicate task or model call was created.

The RC3 room-separation rerun also confirmed that no dated journal was written
into long-term memory, no nested workspace was created, and an immediate second
check returned `no-tasks-due`.
