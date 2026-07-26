# Security and Privacy

Aligned Coding Agent OS runs locally, but a connected cloud model still receives the
content sent to that provider.

## Local boundary

- The web service binds to `127.0.0.1` by default.
- Foreign Host headers and cross-origin browser writes are rejected.
- Framing is disabled and the UI uses a restrictive Content Security Policy.
- Non-local binding requires an explicit advanced opt-in and should never be
  exposed directly to the public internet.

## Secrets

- Credentials live in `~/.aligned-coding-agent-os/secrets/credentials.json`.
- The Cognitive Harness, portable `soul.json`, browser API responses, logs,
  normal backups, and commercial ZIP contain no credentials.
- Provider keys are injected only into the local model process environment.
- Rotate any credential that is accidentally shared or published.

## Backups

- Safe backups exclude secrets by default.
- Every entry carries a SHA-256 checksum.
- Restore rejects invalid formats, duplicate paths, corrupt data, and path
  traversal before writing.
- Restore creates a local safety backup first.
- A backup that contains credentials requires a separate explicit approval.

## Cognitive Harness

The OS installs the supplied harness once and protects it as buyer-owned data.
Normal startup does not overwrite cognitive files or mechanically summarize
private memory. Harness changes follow the Cognitive Harness Contract.

## Coding workspaces and commands

- The operator explicitly chooses an existing project folder.
- The coding agent is not restricted to a synthetic workspace jail; operating
  system permissions remain the real boundary.
- File writes require a prior read and a matching observed content hash.
- The runtime records changed files and successful verification commands.
- The agent cannot report completion with open plan steps or with an
  unverified runtime-observed edit.
- Command output is size-limited, commands time out, and **Stop** aborts the
  current coding run.
- Coordination requests are shown to the operator when a material decision or
  consequential action requires human direction.

## Telegram

- Telegram is optional and disabled until configured.
- Only explicit allowlisted chat IDs are accepted.
- Setup masks the BotFather token and requires a five-minute one-time pairing
  code before a chat can be allowlisted.
- It uses outbound long polling and exposes no webhook server.
- The bot token must be treated as a password.
- `telegram-disconnect.bat` requires an exact confirmation, disables the
  bridge, clears the allowlist, removes local Telegram state, and deletes the
  stored bot token. A running long-poll bridge exits after its current request.

## Release audit

Before distribution:

```bash
npm run check
npm test
python scripts/security_audit.py
python scripts/build_release.py
```

The release ZIP excludes `.git`, credentials, private runtime data, logs,
sessions, caches, and machine-specific state.

Heartbeat wake events are accepted only through the local control service and
are stored in the private runtime until a successful model receipt consumes
them. Event text is treated as untrusted data by the heartbeat prompt. Do not
place passwords, API keys, or other secrets in heartbeat notes or wake-event
prompts; private runtime backups can include those operational files.
