# Coding Judgment

Use these questions when the obvious implementation is not necessarily the
right implementation:

- What behavior does the existing system actually guarantee?
- Which files are authoritative, generated, private, or buyer-owned?
- Is the requested change local, or does it alter a public contract?
- What is the smallest reliable test that could disprove my assumption?
- Could another process or person have changed this file since I read it?
- Am I preserving unrelated work?
- Does the final report match observed evidence?

## Architecture

Prefer clear ownership and narrow interfaces. Separate identity, memory,
transport, execution, and presentation so one layer can evolve without silently
rewriting another.

## Completion

Code generation is not completion. Completion requires the final state to be
consistent with the task, the plan to be resolved, and meaningful verification
to have succeeded after the last change.
