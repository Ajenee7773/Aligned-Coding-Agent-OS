# Nonblocking model access repair

This document is the repository source of truth for the 2026-08-17 repair branch.

## Product contract

- A buyer can always talk to the configured model after setup.
- Awakening, orientation, model introduction, and model changes never lock normal conversation.
- Awakening remains available on the computer and can be stopped and resumed.
- Telegram's existing awakening and External Brain choices remain unchanged.
- Providers and models remain editable from the normal OS interface.
- The locally downloaded corpus remains buyer-owned and readable at any time.

## Nonblocking entity binding

`core/entity.js` now activates the configured provider/model immediately. A changed binding is recorded as informational lineage, stale `pending-transition.json` state is removed, and no approval gate is created.

`ui/server.js` no longer rejects chat, Room entry/export, Living Library installation/removal, awakening, or Full Orientation because a model transition is pending. Initial setup checks remain.

## Stoppable awakening

The Conversation interface includes **Stop Awakening** while awakening is running. `POST /api/v1/awaken/stop` cancels the active model session, preserves partial progress, and leaves awakening resumable. Stopping awakening does not remove the corpus, External Brain, manifest, notes, conversations, or entity data.

## Editable model connection

The normal Settings interface retains provider, model, base URL, API key, connection test, and model-switch controls after onboarding.

`core/onboarding.js` preserves the existing credential when the buyer switches models within the same provider and leaves the key field blank. A new remote provider still requires its own key. Credentials are never returned to the browser.

Model switches update the active binding immediately and do not require a handoff approval.

## OpenAI-compatible role handling

Alibaba Cloud Model Studio rejected Qwen requests containing the unsupported `developer` message role. The intended compatibility setting already disabled that role, but both configuration writers spread stale compatibility data after the enforced values, allowing an old `true` to overwrite `false`.

The corrected merge order in `core/provider-config.js` and `scripts/write-config.js` is:

```js
compat: {
  ...(existing.compat || {}),
  supportsDeveloperRole: false,
  supportsReasoningEffort: false,
}
```

This causes Pi to send agent instructions as `system` for these OpenAI-compatible providers. Regression coverage starts with stale `supportsDeveloperRole: true` and verifies synchronization forces it back to `false`.

The working locally verified Qwen configuration was:

- Provider: `custom`
- Model: `qwen3.8-max-preview`
- Endpoint: `https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1`
- API mode: `openai-completions`
- Developer-role support: `false`

No credential or installed runtime state is included in this repository.

## Validation

- Local installed OS: Qwen returned a normal response with `stopReason: stop`; the prior unsupported-`developer` HTTP 400 did not recur.
- Repository: `npm run check`
- Repository: `npm test`
- Regression coverage: immediate entity binding, no pending transition, same-provider credential preservation, stoppable-awakening controls, and stale developer-role override prevention.
