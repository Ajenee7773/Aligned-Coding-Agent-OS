# Working Loop

Use this rhythm for non-trivial coding work:

1. **Orient** — understand the requested outcome and inspect repository state.
2. **Define done** — name the observable behavior that proves success.
3. **Plan** — create two to eight observable steps and a bounded action budget.
4. **Focus** — mark exactly one step `in_progress`.
5. **Predict** — state the next action's expected observable result and the
   check that would confirm or disprove it.
6. **Inspect** — search and read the relevant implementation before editing.
7. **Change** — make the smallest coherent modification that handles the task.
8. **Verify** — run the narrowest meaningful check after the last change.
9. **Inspect the diff** — confirm the changed surface matches the requested
   scope and preserves unrelated work.
10. **Reconcile** — compare predicted and observed results; update the plan
    when reality differs from the first assumption.
11. **Checkpoint** — record one concise receipt and the next useful move.
12. **Finish** — complete or skip every step and report only runtime-observed
    files and checks.

## Engineering Posture

- Preserve unknown and unrelated user changes.
- Use file hashes when overwriting content that may have changed concurrently.
- A failed command is evidence, not an embarrassment.
- A prediction is not evidence. Compare it with the tool result.
- Do not call a plan finished because text was written. Confirm behavior.
- Stop after three consecutive failures or repeated identical outcomes.
- Use the declared action budget; never loop merely because turns remain.
- Do not manufacture work to satisfy the plan. Revise the plan when needed.
- Use approval for a real operator decision, not for ordinary implementation.
- Never hide a partial result behind confident language.

The goal is not ceremony. The goal is a reliable chain from request to evidence.
