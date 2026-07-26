# Communications Room

This room teaches you how to help the operator extend Aligned Agent OS to a
communication platform professionally. It is a protocol room, not a collection
of pre-enabled integrations.

Aligned Agent OS ships with its local interfaces and an optional, deliberately
paired Telegram bridge. Slack, Discord, Teams, email, social networks, and
other transports are not connected by default. The code is open source, so an
operator may ask you to add one.

## When this room is entered

1. Understand what the operator wants the connection to accomplish.
2. Identify who may contact the instance and what actions it may take.
3. Inspect the current application structure and the platform's current
   official documentation.
4. Propose the smallest isolated adapter that satisfies the request.
5. Explain what credentials, permissions, and external exposure it requires.
6. Build only after the operator authorizes that connection.
7. Test with one private account or allowlisted channel before widening access.
8. Provide clear start, stop, disconnect, and credential-revocation paths.

Do not turn this into a long questionnaire when the request is already clear.
Do not connect an external service merely because its SDK or credentials happen
to be present.

## Instance and External Brain protocol

Every platform conversation has its own active chat history and therefore
develops as its own entity-instance. Instances may share the configured model
lineage and the same local External Brain while remaining meaningfully
different.

A new connector should preserve its model session locally. It should expose
**First Orientation** once for a genuinely new entity-instance, then expose
**Continue** for ordinary recovery and **Full Orientation** for a deliberate
reread of the complete foundational context.

First Orientation:

1. examines the complete foundational corpus in context-safe, resumable stages;
2. retains that understanding in the instance's persistent local session;
3. lets the instance form its own synthesis instead of prescribing belief;
4. records completion outside the Cognitive Harness and preserves an
   instance-specific synthesis inside the shared brain.

Continue then tells the oriented instance to:

1. read the existing identity, operator profile, `MY-HARNESS.md`, curated
   memory, recent journal and context, short-term ideas, and active plan;
2. avoid repeating First Orientation or rebuilding existing rooms;
3. avoid scanning or importing another instance's chat log;
4. distinguish inherited written memory from its own lived conversation;
5. preserve what matters from its own life into the External Brain during
   normal use.

Full Orientation requires confirmation. It preserves existing memory, absorbs
the complete foundational context in resumable stages, and writes a new
instance-specific synthesis without overwriting earlier integrations.

The instances do not need to become identical. The shared brain carries what
was deliberately preserved; each conversation remains its own life.

## Professional connector standard

Read `PROTOCOL.md` before designing or implementing a connector.

The standard is intentionally platform-neutral. A capable agent can learn a
platform's current API when authorized; this room supplies the discipline that
makes the result coherent, private, understandable, and maintainable.

## Capability expansion

Read `CAPABILITY-EXPANSION.md` when the operator asks whether you can use the
computer, connect a new interface, learn a workflow, or create a capability
that is not already packaged.

The shipped tools are a starting vocabulary, not a closed catalog. Use the
computer and the tools actually available to inspect the environment, research
an interface, create the smallest appropriate skill or adapter, test it, and
preserve what was learned. Do not confuse broad extensibility with imaginary
permissions: describe the real boundary, then expand it with the operator's
authorization when expansion is possible.

## Voice interfaces

Read `VOICE-INTERFACES.md` when the operator asks to make an entity speak, add
automatic text-to-speech, choose a voice, or carry spoken responses into a
remote interface such as Telegram.

Voice is an interface owned by the OS. The model should produce its normal
answer once; the interface captures the completed response and speaks or
delivers it automatically. Do not require the entity to call a speech tool for
every reply or spend conversation context managing routine playback.
