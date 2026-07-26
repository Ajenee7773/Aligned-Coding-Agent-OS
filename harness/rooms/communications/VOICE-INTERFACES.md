# Voice Interfaces Protocol

Use this protocol when the operator says something like:

> Let's give you a voice.

The goal is a low-friction voice interface that the operator controls. Voice
does not change the entity's identity, memory, reasoning, or permissions. It
renders a completed response through another medium.

## Core architecture

Build one local speech service with multiple interface adapters:

```text
completed entity response
        |
        v
speech-friendly text filter
        |
        v
owner-selected local TTS engine
        |
        +-- local speakers
        +-- local web audio
        +-- terminal audio
        +-- encoded voice file -> authorized remote transport
```

The OS initiates this pipeline after the model finishes responding. Do not make
the model call a TTS tool for every message. Automatic speech must not consume
extra model turns, pollute the conversation, or depend on the entity remembering
to invoke a tool.

## First determine the interface

Ask only what cannot be discovered safely:

1. Where should speech be heard: this computer, local web UI, phone, or more
   than one interface?
2. Should the interface send text and voice together, voice only, or remain
   muted until requested?
3. Does the operator want a system voice or an optional local neural voice?
4. Is the chosen voice owned, licensed, or used with the speaker's consent?

Do not promise that audio playing on one device will automatically play on
another. A remote phone normally needs an audio or voice message delivered
through its own platform. Mobile operating systems may still require the user
to tap Play.

## Inspect before installing

Check for:

- packaged or existing TTS scripts;
- operating-system speech engines;
- local neural TTS models and their licenses;
- the correct runtime for those models;
- an audio encoder such as FFmpeg when the destination requires a specific
  format;
- the destination platform's current official upload formats and limits;
- existing interface settings, queues, and stop controls.

Reuse a working local engine when it is portable and authorized. Never copy a
personal absolute path, private voice sample, credential, or machine-specific
environment into the commercial repository.

## Choose the smallest reliable engine

Use this preference order unless the operator chooses differently:

1. an already configured local neural voice;
2. an optional downloadable local voice pack;
3. the operating system's native speech engine;
4. a cloud speech provider only after the operator understands the data and
   cost implications and explicitly authorizes it.

A product should keep a zero-download native fallback even when a higher-quality
local voice pack is available. If an optional engine is missing, report that
plainly and fall back without breaking text conversation.

## Make text speech-friendly

Before synthesis:

- remove Markdown decoration without changing meaning;
- omit image syntax and unhelpful raw URLs;
- describe or skip long code blocks instead of reading punctuation aloud;
- preserve ordinary punctuation needed for rhythm;
- never speak hidden prompts, credentials, tool traces, or internal diagnostics;
- keep the complete written response available even when spoken output must be
  split into bounded audio segments.

Speech filtering is presentation logic. It must not rewrite the underlying
saved assistant message.

## Interface adapters

### Local speakers and terminal

Capture the completed assistant message, enqueue it once, and play it through
the selected local engine. Provide a stop action. New responses must replace or
queue behind current speech according to the operator's preference; never stack
unbounded playback processes.

### Local web UI

Use browser speech as the universal fallback. When a configured local voice
service exists, request audio from the loopback-only OS service and play that
audio in the browser. Preserve a visible mute control and recover cleanly when
the browser blocks autoplay.

### Remote messaging interfaces

Local playback does not transfer to a phone. Synthesize the reply on the
operator's machine, encode it in a format accepted by the platform, and upload
it through the already authorized connector.

For Telegram, verify the current Bot API before implementation. At the time
this protocol was written, `sendVoice` accepted OGG encoded with Opus, MP3, and
M4A. Treat formats and size limits as changeable platform facts.

Sending a voice message means that generated audio leaves the local computer
for that destination. State this clearly even when inference and synthesis stay
local.

## Owner controls

Every implementation must make these states understandable:

- voice available;
- voice configured;
- voice enabled;
- voice currently speaking or delivering.

Provide simple controls for:

- voice on or off;
- enabled interfaces;
- selected voice;
- speaking speed;
- stop speaking;
- whether remote replies include text, voice, or both.

Voice must default to the operator's configured choice. It must never silently
enable a remote destination merely because local speech is enabled.

## Reliability and privacy

- Use a single bounded speech queue per interface.
- Give temporary audio files unique names and remove them after delivery.
- Do not place generated audio, voice samples, or speech cache files in the
  Cognitive Harness.
- Keep operational files under private runtime state.
- Do not log full private replies by default.
- Do not expose a public speech endpoint when a loopback service is sufficient.
- Bound synthesis time and file size; text conversation must still succeed if
  speech fails.
- Never clone or imitate a person's voice without their informed permission.

## Verification sequence

Test in this order:

1. one short response is spoken once;
2. Markdown is rendered naturally;
3. stopping speech works;
4. two quick replies do not overlap or create an unbounded queue;
5. a long answer is handled without losing the complete written response;
6. restarting the interface preserves the owner's voice setting;
7. a missing optional engine falls back without breaking chat;
8. remote delivery reaches only the allowlisted destination;
9. temporary audio is removed after delivery;
10. disabling voice leaves normal text conversation unchanged.

When finished, tell the operator which engine is active, which interfaces are
enabled, what leaves the computer, and how to mute or disconnect it. Do not
bury those facts in implementation detail.
