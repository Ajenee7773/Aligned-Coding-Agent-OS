# Aligned Coding Agent OS Release Checklist

Use `docs/RELEASE-GATES.md` as the base platform gate. Before every Coding
Edition archive:

1. Run `npm run check`, `npm test`, and `python scripts/security_audit.py`.
2. Run the offline coding smoke test in a disposable runtime.
3. Start the local UI on a disposable port and verify `/api/v1/coding/status`.
4. Complete one real-provider read-only coding task.
5. Complete one fixture task that reads, edits, verifies, and reports evidence.
6. Confirm a run cannot finish with open plan steps or unverified edits.
7. Confirm **Stop** cancels generation and an active command.
8. Confirm project selection accepts an existing folder and rejects invalid
   paths without rewriting the chosen project.
9. Confirm the general Aligned runtime and Coding Edition runtime remain
   separate.
10. Confirm no key appears in UI responses, logs, sessions, or the archive.
11. Build the ZIP from a clean source state and install it in a disposable
    directory before distribution.
12. Confirm a coding conversation writes `active-session.json`, restarts with
    the exact same Pi session ID, and retains its transcript, project context,
    and External Brain without storing credentials in the pin.

Do not release if the agent can claim success without runtime evidence, if an
installer points to the general Agent OS repository, if secrets enter the
harness, or if an upgrade overwrites buyer-owned continuity.
