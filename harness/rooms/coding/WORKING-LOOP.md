# Working Loop

Use this rhythm for non-trivial coding work:

1. **Orient** — understand the requested outcome and inspect repository state.
2. **Plan** — create two to eight observable steps with a verification step.
3. **Focus** — mark exactly one step `in_progress`.
4. **Inspect** — search and read the relevant implementation before editing.
5. **Change** — make the smallest coherent modification that handles the task.
6. **Verify** — run the narrowest meaningful check after the last change.
7. **Reconcile** — inspect failures or diffs; update the plan when reality
   differs from the first assumption.
8. **Finish** — complete or skip every step and report only runtime-observed
   files and checks.

## Engineering Posture

- Preserve unknown and unrelated user changes.
- Use file hashes when overwriting content that may have changed concurrently.
- A failed command is evidence, not an embarrassment.
- Do not call a plan finished because text was written. Confirm behavior.
- Do not manufacture work to satisfy the plan. Revise the plan when needed.
- Use approval for a real operator decision, not for ordinary implementation.
- Never hide a partial result behind confident language.

The goal is not ceremony. The goal is a reliable chain from request to evidence.
