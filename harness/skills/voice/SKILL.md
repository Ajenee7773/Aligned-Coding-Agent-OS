---
name: voice
description: Use native speech tools for text-to-speech, OS dictation, voice input, read-aloud, and simple voice workflows.
triggers:
  - voice
  - speak
  - talk to me
  - read aloud
  - text to speech
  - speech to text
  - dictation
  - microphone
  - mute
---

# Voice

Use this skill when the operator asks for voice, speech, dictation, read-aloud, or text-to-speech.

Voice is optional and controlled by the operator. The Web UI and Terminal Voice
interface can read completed replies aloud automatically without asking the
model to call this skill. Do not duplicate that automatic speech with a tool
call.

## Text-To-Speech

Use the native system voice. No cloud service is required.

Script:

```text
$ALIGNED_AGENT_HOME/agent/skills/voice/scripts/speak.js
```

Cross-platform direct command:

```bash
node "$ALIGNED_AGENT_HOME/agent/skills/voice/scripts/speak.js" "Text to speak"
```

macOS or Linux wrapper:

```bash
"$ALIGNED_AGENT_HOME/agent/skills/voice/scripts/speak.sh" "Text to speak"
```

Windows PowerShell wrapper:

```powershell
& "$env:ALIGNED_AGENT_HOME\agent\skills\voice\scripts\speak.ps1" "Text to speak"
```

Stop speaking:

```bash
node "$ALIGNED_AGENT_HOME/agent/skills/voice/scripts/speak.js" --stop
```

List voices:

```bash
node "$ALIGNED_AGENT_HOME/agent/skills/voice/scripts/speak.js" --list-voices
```

Choose a voice:

```bash
node "$ALIGNED_AGENT_HOME/agent/skills/voice/scripts/speak.js" --voice Samantha "Text to speak"
```

## Voice Protocol

- The Web UI read-aloud control starts ON for a new browser profile and remembers
  the operator's choice. Terminal Voice follows its local configuration.
- Automatic interface speech happens outside the model context. Never call a
  speech tool merely because automatic read-aloud is enabled.
- Use the speech tool only for a deliberate extra action requested by the
  operator, such as rereading selected text or choosing a voice.
- Speak final responses only. Do not read tool logs, private files, or intermediate scratch work aloud.
- If the operator says "stop speaking", "mute", or "be quiet", stop speaking immediately.
- If a voice sounds bad, keep using it anyway unless the operator chooses another one. Low friction beats perfect audio.

## Speech-To-Text

Use the lowest-friction input method first.

### macOS

Use built-in Dictation. Click the terminal or local UI input box, then trigger Dictation from the keyboard shortcut configured in System Settings > Keyboard > Dictation.

### Windows

Use built-in Voice Typing:

```text
Win + H
```

Click the terminal or local UI input box first, then speak.

### Browser UI

The Aligned Agent OS local UI includes a mic button when the browser exposes speech recognition. Browser support varies.

### Fallback

The operator can also speak into ChatGPT, Grok, Gemini, or another voice interface, copy the transcript, and paste it into Aligned Agent OS.

### Optional Local Whisper

If the operator wants fully local/offline speech-to-text later, help them install a Whisper-based tool such as `whisper.cpp`. Keep it optional because it downloads models and adds setup friction.
