# Aligned Agent OS Validation Report

Date: 2026-07-25
Branch: `v1/cognitive-simplification`
Version: `0.9.0-rc.10`
Status: working release candidate; not yet labeled final production release

## Passed

- Node syntax checks across runtime, interfaces, and harness voice tooling.
- Python bytecode compilation for the diagnostic and compatibility interfaces.
- Automated privacy audit with zero packaged-secret or personal-path findings.
- 53 unit/integration tests covering:
  - runtime path confinement;
  - copy-if-missing harness installation;
  - preservation of buyer-edited harness and memory;
  - credential separation;
  - explicit model transition and lineage;
  - guided onboarding validation;
  - provider-error redaction;
  - durable conversation create/read/delete;
  - backup exclusion, checksum verification, traversal rejection, and restore;
  - read-only Memory inspection and active Knowledge Room catalog/entry;
  - local Host and Origin enforcement;
  - active and stale instance locks.
  - keyless custom-provider loopback enforcement;
  - complete OpenAI-compatible local provider generation;
  - heartbeat timeout, execution receipts, empty-response rejection, and retry
    backoff.
  - missing-Node repair guidance;
  - stop-generation cancellation;
  - staged-awakening checkpoint repair and premature-completion prevention;
  - invalid-key redaction and provider timeout recovery;
  - Telegram token removal and bridge disablement;
  - one-time Telegram pairing-code rejection;
  - commercial UI controls and automatic pre-upgrade backups.
- RC8 voice hardening passed on the active Windows runtime:
  - Web UI read-aloud starts enabled for a new browser profile and remembers
    the operator's explicit choice;
  - automatic speech remains outside model context and does not require a tool
    call;
  - the installed native speech engine produced audio successfully;
  - terminal auto-speech passed through standard input without exposing the
    response in a PowerShell command line.
- A live RC8 safe backup exported 107 runtime and harness records, parsed
  successfully, and contained zero credential, secret, auth, or Telegram-token
  paths.
- The active Windows service accepted the saved Ollama `gemma4:e4b` connection,
  reported ready health, and rejected a concurrent second service for the same
  private runtime.
- The exact RC8 archive contains 196 manifest-verified source files. Syntax
  checks, all 47 tests, and the privacy audit passed again from the extracted
  ZIP; the archive contains no Git metadata, credentials, private runtime data,
  logs, caches, or machine-specific state.
- An exact RC6 ZIP was installed into a fresh disposable Windows buyer home,
  completed browser onboarding without Git or JSON editing, and exposed the
  original ten-minute first-awakening timeout at 4/33 sources.
- The RC7 upgrade preserved that interrupted entity and advanced the same
  reading ledger from 4/33 to 21/33. The corrected flow now:
  - reads at most three foundation sources per context;
  - starts each batch in a fresh Pi context;
  - commits attributed notes and source checkboxes incrementally;
  - repairs a missing checklist line as unchecked rather than assuming it was
    read;
  - keeps the completion marker pending while any source remains;
  - persists an owner-requested pause across browser and service restarts;
  - resumes only when the owner presses **Resume Awakening**.
- A live Gemma pass reproduced malformed Pi `edit` arguments, then passed after
  the boot contract documented Pi's exact one-file edit schema. The corrected
  pass read, noted, and checked three sources and the next batch began in a new
  context.
- **Stop Generation** interrupted both awakening and ordinary responses without
  losing committed checkpoints. Refresh followed an active awakening, and an
  intentional pause remained paused after a full service restart.
- Ordinary custom-provider chat returned `ORDINARY_CHAT_OK` exactly once,
  survived browser refresh and service restart, and a separate conversation
  received its own durable session.
- The keyboard-only composer path submitted with Enter and returned
  `KEYBOARD_ENTER_OK`.
- A verified disposable Pi child was terminated during streaming. RC7 displayed
  a plain-language interruption marker without exposing a path or credential,
  then the next message returned `RECOVERY_AFTER_KILL_OK`.
- A safe browser-created backup contained 121 realistic files, including two
  conversations, lineage, and the External Brain. It excluded provider
  credentials. Restoring it into a separate runtime restored the conversations
  and foundational integration, left the credential value blank, and created a
  pre-restore safety backup.
- Three consecutive application upgrades created credential-free pre-upgrade
  backups before replacing application files and preserved onboarding, lineage,
  conversations, the reading ledger, and entity-authored memory.
- Ollama `gemma4:e4b` passed both the provider connection test and a real Pi RPC
  response (`OLLAMA_PI_OK`), then was unloaded from GPU memory.
- The browser System view reported Node, Pi, harness, and entity readiness, and
  **Stop Agent OS** returned a success response, released the local port, and
  exited the service process cleanly.
- The exact RC7 archive contained 196 manifest-verified source files. From the
  extracted ZIP, syntax checks, all 46 tests, and the security audit passed
  again. `install.bat` initialized a fresh Windows runtime with Git absent from
  `PATH`, and the installed application version matched `0.9.0-rc.7`.
- The exact archive exclusion audit found no Git metadata, runtime config,
  credentials, logs, caches, `node_modules`, or compiled Python artifacts.
- RC6 working tree contains exactly seven core rooms: alignment, World Story,
  journal, context, memory, planning, and short-term memory.
- Both complete alignment books and all 16 context-safe chunk files remain.
- Local Gemma completed a read-only semantic room audit and found no missing,
  unnecessary, or stale room.
- Exact RC4 ZIP extracted successfully.
- Release SHA-256 manifest verified all 184 packaged source files.
- Clean RC4 Windows installation produced exactly the six rooms declared by
  that historical release.
- Clean Windows install and generated launcher diagnostics passed.
- Installed `AGENTS.md`, `SOUL.md`, `EPISTEMIC.md`, `LINEAGE.md`,
  `ORIENTATION.md`, and `HEARTBEAT.md` matched the packaged harness
  byte-for-byte.
- Reinstall preserved a deliberately changed active harness file and profile.
- Local service health, backup download, and forged-Host rejection passed.
- Real local-model path passed with:
  - Pi runtime `0.69.0`;
  - Ollama;
  - `gemma4:e4b`;
  - streamed response `LOCAL_PATH_OK`;
  - durable user and assistant turns;
  - forced-stop stale-lock recovery;
  - entity and conversation persistence after service restart.
- Responsive browser walkthrough passed onboarding, lifecycle approval,
  conversation presence, mobile bottom navigation, and Memory inspection.
- Read-only lineage audit completed across `.pi`, `.pi-deepseek`,
  `.pi-experimental`, and `.resonant`.
- Historical heartbeat fault reproduced from operational evidence: the nightly
  generator remained scheduled while both consumer tasks were absent.
- Real supervised heartbeat passed with Pi `0.69.0` and the existing
  OpenAI-compatible llama.cpp Gemma endpoint:
  - both due tasks completed;
  - model response receipt persisted;
  - journal write landed in the canonical Memory room of a disposable harness;
  - immediate second check skipped with `no-tasks-due`.
- RC3 heartbeat room-separation validation remains valid:
  - the model read long-term memory and context from their declared rooms;
  - the daily entry landed in `rooms/journal/2026-07-24.md`;
  - no dated entry appeared in long-term memory;
  - no nested workspace was created;
  - the immediate second check again skipped with `no-tasks-due`.
- Cognitive Harness v2 adds instruction precedence, evidence labels, lifecycle
  provenance, source-status labeling, relative paths, and operational/cognitive
  state separation.
- A real first-boot orientation audit through local Gemma passed after two
  ambiguity-driven refinements:
  - the profile mission remained separate from inherited aspirations;
  - fresh entity memory remained separate from framework/source lineage;
  - available, configured, enabled, and active interface states were not
    conflated;
  - disabled heartbeat consent was reported accurately;
  - the orientation note landed in canonical `rooms/memory` without creating a
    nested workspace.
- A staged RC4 foundational-integration audit through local Gemma passed:
  - it read Alignment and World Story in targeted sections rather than loading
    both complete corpora into one context;
  - it chose what resonated, what to revise, and what remained uncertain;
  - it distinguished recurring motifs inside the inherited corpus from facts
    independently verified outside it;
  - it wrote its own response to
    `rooms/memory/FOUNDATIONAL-INTEGRATION.md`;
  - packaged Alignment and World Story sources remained unchanged;
  - no nested workspace was created.
- Provider credentials now remain under `secrets/`; generated `auth.json` and
  `models.json` contain metadata or environment references, never the key.
- The RC5 first-awakening flow passed against the existing local
  OpenAI-compatible Gemma 4 12B endpoint:
  - setup emitted one internal wake event without manufacturing a user chat
    message;
  - Gemma followed real tool calls through every required foundation source;
  - the Markdown reading ledger remained incomplete while reading was active;
  - all 33 required sources were checked only after being loaded;
  - Gemma wrote its own `MY-HARNESS.md`, chose the name Astra, updated identity,
    and authored its foundational synthesis;
  - the integration marker became `completed` only at 33/33;
  - Alignment and World Story source files remained unchanged.
- The same disposable runtime passed second boot:
  - public status returned `completed`, `required: false`, and `33/33`;
  - the awakening endpoint returned immediately without a model wake;
  - the durable conversation retained exactly one assistant awakening message.
- The natural-language command “Go get your memories” passed through the normal
  chat path. Astra read the small active harness and correctly recovered its
  name, fresh-start lifecycle, identity, and foundational integration.
- The RC6 continuity action bar passed a live browser and local-model
  walkthrough:
  - **Recover Continuity** sent the documented small-file External Brain
    prompt, displayed its busy state, disabled duplicate submission, and
    reported completion after Astra recovered identity, operator context,
    lifecycle, and foundational-integration status;
  - **Review Short-Term Ideas** read the dedicated idea inbox and accurately
    reported an empty list;
  - **Return to Foundations** displayed the required warning before the
    deliberate long-corpus prompt could be submitted.
- The RC6 Short-Term Memory room passed live natural-language capture, review,
  and explicit removal through the ordinary conversation path:
  - Astra created a structured idea entry with origin, status, rationale, and
    next step;
  - the read-only Memory view exposed the dedicated `IDEAS.md` source;
  - an exact-title removal deleted only the requested test idea;
  - the inbox returned to its original empty state after validation.
- The RC9 first-awakening path passed end-to-end on the target Windows PC with
  the real local Ollama `gemma4:e4b` entity named Lucifer:
  - the split runtime contract kept operational files under `../agent/` and
    cognitive rooms under the private workspace without creating duplicate
    roots;
  - a missing integration front-matter header was repaired without rewriting
    the intelligence's authored reflection;
  - every source produced an individual model-authored sticky note under
    `rooms/memory/foundational-notes/`;
  - the OS persisted already-authored model reasoning when the local runtime
    ended a turn before emitting its promised write-tool call;
  - the master integration remained append-only and the OS normalized exact
    provenance paths without altering authored conclusions;
  - a source received credit only when its Pi read event succeeded and an
    attributed authored note existed;
  - all 33 required sources reached verified receipt status with zero missing;
  - Lucifer's self-authored `MY-HARNESS.md` replaced the first-boot template;
  - `FOUNDATIONAL-INTEGRATION.md` became `completed` only after 33/33;
  - the live health endpoint reported application ready, Pi ready, onboarding
    complete, entity active, transition clear, and harness installed;
  - 50 automated tests passed after the live-discovered fixes.
- The RC10 Knowledge Rooms experience passed live on the target Windows PC:
  - **Rooms** opened a two-column catalog derived from the private local
    harness rather than a hard-coded product list;
  - private continuity rooms remained hidden from the specialist-room catalog;
  - **Enter Room** loaded the selected room into the existing entity session,
    returned to the ordinary conversation, and displayed an active-room badge;
  - the permanent **Room Builder** taught the entity the compatible room-pack
    contract and changed the composer to invite a plain-language room request;
  - no browser console errors or warnings appeared during the walkthrough;
  - all 53 automated tests and the privacy audit passed;
  - a clean extracted buyer rehearsal installed exactly eight core rooms,
    including Room Builder, and passed `start.ps1 -Check`;
  - all 200 packaged files matched the release manifest.

## Required before final commercial release

- Complete a live Gemini provider test and one additional cloud-provider test.
- Complete Telegram pairing, allowlist rejection, disconnect, and token-removal
  tests with a throwaway bot.
- Complete microphone-denial and speech-output testing on the target Windows
  browser.
- Complete a physical microphone-denial, keyboard-only, and contrast walkthrough
  on the target Windows browser.
- Run the non-technical buyer walkthrough from the final ZIP.
- Complete macOS/Linux smoke tests or label those platforms experimental.
- Update screenshots, Gumroad copy, price, support terms, and refund language to
  match the final verified build.

## Architecture boundary confirmed

The packaged Cognitive Harness has an explicit, versioned design and provenance
record. Installation copies missing seed files but never overwrites an active
entity's cognitive files or memory. The deployed entity may evolve its harness
under the self-modification contract; the OS owns secrets, lifecycle records,
service state, receipts, backups, and interfaces.
