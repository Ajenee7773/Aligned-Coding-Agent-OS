# Professional Connector Protocol

## 1. Deliberate activation

- New transports are disabled until the operator explicitly configures and
  enables them.
- Capability is not consent. Do not send a message, join a workspace, expose a
  listener, or invite another person merely because the integration can do so.
- State whether the connector is available, configured, enabled, and currently
  running.

## 2. Narrow boundaries

- Define which accounts, users, chats, channels, or workspaces are allowed.
- Default to one private, allowlisted destination.
- Ignore unapproved senders instead of letting them invoke the model.
- Request only the platform permissions required for the named use case.
- Separate reading, replying, posting, file access, administration, and
  deletion into distinct capabilities.

## 3. Credentials stay outside the brain

- Accept tokens and keys through a hidden local prompt or an owner-controlled
  secret store.
- Never put credentials in a Knowledge Room, memory file, repository, chat
  response, screenshot, log, or diagnostic bundle.
- Never echo a credential in an error.
- Make disconnecting include a clear path to remove the local token and revoke
  it at the provider.

## 4. Minimize external exposure

- Prefer outbound connections such as polling when they satisfy the platform
  and use case.
- Do not expose a public webhook, open a router port, or add a tunnel silently.
- When inbound public access is genuinely required, explain the new attack
  surface and obtain explicit authorization before enabling it.
- Keep each adapter isolated so adding one platform does not silently grant
  access to another.

## 5. Preserve instance boundaries

- Give each platform conversation its own session history.
- Share only the local External Brain and explicitly designated files.
- Never claim another instance's unwritten conversation as lived memory.
- Do not scan entire chat histories to force synchronization.
- Preserve source and timestamp when writing inherited or cross-instance
  information into durable memory.

## 6. Make the experience feel finished

- Preserve each connector's model session locally and resume it after service
  restarts.
- Offer **First Orientation** once for a genuinely new instance, then a simple
  **Continue** action to load the External Brain.
- Use typing indicators or concise progress messages when supported.
- Split responses at the platform's message limit without corrupting meaning.
- Translate technical failures into plain language without leaking internals.
- Confirm meaningful external actions and clearly identify partial failures.
- Keep ordinary conversation free of repetitive status boilerplate.

## 7. Operate reliably

- Respect rate limits and use bounded retries with backoff.
- Prevent duplicate processing with platform update or event identifiers.
- Never stack unbounded polling jobs, retries, or background tasks.
- Store operational cursors and receipts outside the Cognitive Harness.
- Log only what is needed to diagnose operation; redact private content and
  secrets by default.

## 8. Verify before widening access

Test in this order:

1. credentials accepted without being printed;
2. one allowlisted account can pair;
3. an unapproved account is ignored;
4. First Orientation examines the corpus once and persists its completion;
5. Continue afterward loads only the shared External Brain;
6. one inbound message receives one response;
7. restart resumes the same local model session without duplicating messages;
8. disconnect disables the bridge and removes the local secret;
9. only then consider additional people or channels.

## 9. Leave ownership with the operator

Document:

- what was connected;
- which permissions were granted;
- where private runtime state lives;
- how to start and stop the connector;
- how to disconnect it;
- how to revoke the credential;
- what information can leave the computer.

The goal is not maximum connectivity. The goal is a connector whose behavior
the operator can understand, control, and reverse.
