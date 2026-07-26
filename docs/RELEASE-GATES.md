# Aligned Agent OS — Release Gates

No build is labeled production-ready or uploaded for sale until every mandatory gate passes from a clean extracted release archive.

## Gate 1 — Package integrity

- [x] ZIP extracts without errors on a normal Windows account.
- [x] No `.git`, cache, temporary, log, runtime state, or private config is present.
- [x] Automated credential scan reports zero findings.
- [x] License and third-party notices are present.
- [x] Package and application versions agree.
- [x] File manifest and checksums are generated.

## Gate 2 — Clean Windows setup

- [x] Default launcher works without Git.
- [x] Missing Node produces an exact installation path.
- [x] Setup can be resumed after closing the browser.
- [x] Buyer completes setup without manually editing JSON.
- [x] Setup initializes a new runtime home.
- [x] First conversation succeeds.
- [x] Restart returns to usable state.

## Gate 3 — Model paths

- [x] Ollama connection test and first response pass.
- [ ] Gemini connection test and first response pass.
- [ ] One additional supported cloud provider passes.
- [x] Invalid key returns a plain-language error.
- [x] Unreachable endpoint times out and recovers.
- [x] No key appears in UI errors, logs, support bundles, or process output.

## Gate 4 — Entity and Cognitive Harness

- [x] The installed harness matches the packaged source byte-for-byte.
- [x] Normal startup does not rewrite active cognitive files or memory.
- [x] Profile, model binding, harness manifest, and lineage are separately
  inspectable.
- [x] A changed model creates a pending lifecycle transition.
- [x] Fresh start, continuation, succession, fork, and collaboration choices are
  recorded with provenance.
- [x] Updating application files does not overwrite buyer edits or memory.
- [x] Harness changes preserve provenance, pass the Cognitive Harness Contract,
  and are reviewed from inside a disposable first-boot runtime.
- [x] First awakening remains open until the intelligence has checked all 33
  required foundation sources and authored its own integration.
- [x] Completed second boot skips the foundation corpus and preserves the
  entity-authored small harness.

## Gate 5 — Conversation

- [x] Output streams without duplicate or missing final text.
- [x] Stop generation works.
- [x] New conversation creates a distinct durable session.
- [x] Conversation survives browser refresh.
- [x] Conversation survives service restart.
- [x] Recovery after a killed model child is understandable and successful.

## Gate 6 — Memory

- [x] A clean install contains exactly the eight declared core rooms.
- [x] The alignment room retains canonical sources and context-safe chunks.
- [x] World Story retains its chunked corpus, source-status boundary, and
  foundational-integration template.
- [x] Journal, context, and long-term writes reach the correct rooms.
- [x] “Go get your memories” causes the intelligence to recover its own small
  harness, identity, lifecycle, and curated integration.
- [x] Continue sends the documented External Brain prompt and reports
  its busy, completed, and failure states.
- [x] Short-term ideas can be captured, listed, selected, and explicitly
  removed through natural language.
- [x] Buyer can inspect the declared memory sources without the UI rewriting
  them.
- [x] Rooms panel catalogs installed Knowledge Rooms without exposing private
  continuity folders.
- [x] Enter Room loads the selected room into the current entity session and
  returns the buyer to conversation.
- [x] Room Builder can be entered from one button and teaches the entity the
  compatible personal-room format.
- [x] The entity can capture and explicitly remove a named item through natural
  language.
- [x] A safe backup exports the External Brain without credentials.
- [x] Memory source and timestamp are visible.
- [x] Memory survives application upgrade.

## Gate 7 — Voice and accessibility

- [x] Text conversation remains enabled when speech APIs are unavailable.
- [ ] Microphone permission denial has a recovery message.
- [x] Speech output toggle persists.
- [x] Automatic Web UI and terminal speech runs outside model context.
- [x] Installed native speech output produces audio on the target Windows PC.
- [x] Eye/orb states also have text labels.
- [x] Reduced-motion preference is respected.
- [x] Keyboard-only conversation path passes.
- [ ] Color contrast passes the chosen accessibility target.

## Gate 8 — Telegram

- [x] Disabled by default.
- [ ] Pairing creates an explicit allowlist.
- [ ] Approved chat can converse.
- [ ] Unapproved chat receives no agent response.
- [ ] Disconnect stops the bridge and removes the stored token after confirmation.
- [ ] Token never appears in logs or support bundle.

## Gate 9 — Backup, restore, migration

- [x] Default backup excludes secrets.
- [x] Backup containing realistic sessions and memory restores correctly.
- [x] Corrupt archive is rejected before state changes.
- [x] Path-traversal archive is rejected.
- [x] Upgrade creates a pre-migration backup.
- [ ] Migration is idempotent.
- [ ] Failed migration enters recovery mode without destroying old data.
- [ ] Legacy `.resonant` import copies data without mutating the source.

## Gate 10 — Operational safety

- [x] Service binds to localhost by default.
- [x] Second instance detects the active runtime-home lock.
- [x] Stale lock can be repaired.
- [x] Child processes shut down cleanly.
- [x] Heartbeat is off or conservative until opt-in.
- [x] Heartbeat dry run shows the exact planned work.
- [x] A successful heartbeat stores a model completion receipt.
- [x] Empty output, timeout, and provider failure do not mark tasks complete.
- [x] Immediate second check does not duplicate completed work.
- [x] An entity-authored `next_wake` is anchored, consumed once, and can
  schedule a subsequent useful pulse.
- [x] External wake events survive failure and restart, respect retry backoff,
  and are consumed only after a successful model receipt.
- [x] The supervisor checks wake signals without calling the model when no work
  is due.
- [x] Health screen identifies every required component and repair action.

## Gate 11 — Buyer walkthrough

A person who did not build the product must be able to:

1. extract it;
2. launch it;
3. understand local versus cloud model choices;
4. configure an agent;
5. have a first conversation;
6. find and remove a memory;
7. back up their data;
8. understand how to stop the agent;
9. find support diagnostics.

Any point where the tester needs repository knowledge, developer terminology, or undocumented terminal work is a release defect.

## Gate 12 — Commercial truth check

- [x] Quick Start matches the clean ZIP.
- [ ] Screenshots match the shipped UI.
- [ ] Product-page claims are demonstrated by a passing gate.
- [x] Platform support language reflects tested platforms.
- [x] Privacy language distinguishes local storage from model-provider and speech-service network behavior.
- [ ] Support and refund expectations are written before publication.
