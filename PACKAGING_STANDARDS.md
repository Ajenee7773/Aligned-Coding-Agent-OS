# Agent Packaging Decisions

`soul.json` follows the useful convention established by character-based agent frameworks: a single portable document describes identity, biography, traits, operating instructions, and enabled interfaces. Aligned Agent OS extends that pattern with explicit ethical boundaries, inspectable memory-room locations, audio settings, and operator-control rules.

The document is independently versioned and validated by `schemas/soul.schema.json`, using JSON Schema Draft 2020-12. Runtime credentials are deliberately excluded from the soul document.

## Separation of concerns

| File | Responsibility |
|---|---|
| `soul.json` | Shareable identity, behavior, values, memory policy, interface declarations |
| `config.template.json` | Shareable example of machine and provider settings |
| `config.json` | Private buyer settings and secrets; never distributed |
| `harness/` | Expandable long-form context, rooms, skills, and memory templates |
| `run.py` | Boot validation and interface selection |

This division makes the character portable without making credentials portable.
