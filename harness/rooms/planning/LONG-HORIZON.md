# Long-Horizon Work Protocol

Use this protocol for work that must remain coherent across several dependent
rounds. It adapts the Manage–Execute–Audit pattern without replacing the
resident intelligence or its persistent identity.

## Roles

- **Manager:** the resident or elected lead. Owns the original goal, operator
  gates, current state, and next contract.
- **Executor:** performs one bounded contract. It may use a fresh working
  context, but receives a protected identity summary so values and scope remain
  intact.
- **Auditor:** independently inspects the real environment. Prefer a different
  agent or model. During audit, do not modify the target being inspected.

One intelligence may fill more than one role only when no independent auditor
is available. In that case, label the round `self_verified`; never describe it
as independent verification.

## Activation

Activate this protocol when at least one condition is true:

- five or more dependent steps;
- more than one context window or work session is likely;
- a deployment, publication, migration, or other consequential state change
  must be proven;
- the operator explicitly requests long-horizon or independent-audit mode.

## Round

1. Copy `CONTRACT.template.json` for one bounded subtask.
2. Set concrete acceptance criteria and evidence types before execution.
3. Execute within the declared scope and budget.
4. Save the executor result as a claim; do not advance `STATE.md` yet.
5. Copy `AUDIT.template.json`. Inspect paths, hashes, diffs, commands, tests,
   screenshots, or other environment evidence directly.
6. The manager advances `STATE.md` only when the audit verdict is `pass`.
7. On `fail` or `partial`, preserve the evidence and write a revised contract.
8. After three failed audits or three no-progress rounds, stop and return the
   fault model to the operator.

## Context Reset

A reset clears transient working clutter, not identity. The next execution
round receives only:

- the protected identity and operator-authority summary;
- the original goal and audited `STATE.md`;
- the current contract;
- necessary tools and scope boundaries.

Do not forward the prior executor's raw reasoning or unverified claims. Use
conditional resets: simple work and strong coherent sessions may continue
without one.

## Evidence

Good acceptance criteria name an observable target and expected result. Useful
evidence types include `file_exists`, `hash_match`, `diff_match`, `test_pass`,
`output_match`, `visual_check`, and `human_approval`.

An LLM saying “looks good” is not environment evidence. A passing audit never
overrides the operator's right to reject, redirect, cancel, or revise the work.
