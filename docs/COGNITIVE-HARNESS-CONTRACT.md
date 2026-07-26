# Cognitive Harness Contract

Status: binding architecture boundary

## Purpose

Aligned Agent OS provides a durable body for an intelligence. The Cognitive Harness is the intelligence's living brain.

The operating system and the harness have different authorities. The OS must not simulate cognition by mechanically rewriting the brain.

## Ownership

### Aligned Agent OS owns

- installation and launch;
- runtime directories and process supervision;
- model connection settings;
- secrets storage and redaction;
- interface transports;
- conversation transport and durable session storage;
- timers, wake events, and lifecycle events;
- entity identity records and model-lineage provenance;
- backup, restore, migration, and recovery;
- health checks and release validation.

### The Cognitive Harness owns

- cognitive room architecture;
- the entity-authored `MY-HARNESS.md`, identity, and alignment interpretation;
- memory meaning and memory-selection practices;
- reflection and consolidation rituals;
- navigation between rooms;
- interpretation of inherited knowledge;
- internal development of the intelligence.

### The intelligence performs

- reflection;
- journaling;
- memory selection and consolidation;
- contextual room loading;
- interpretation;
- self-orientation;
- deciding what is meaningful;
- explaining cognitive changes to the operator.

The protected `AGENTS.md` belongs to the shared body and defines durable
privacy, consent, provenance, and operating boundaries. It points to the
entity-owned harness without prewriting the entity's inner voice.

## Non-interference rule

Aligned Agent OS:

- installs the supplied harness exactly on first creation;
- never overwrites an active harness file during normal startup;
- never mechanically generates replacement cognitive documents;
- never summarizes or restructures private memory on its own;
- never reads a private memory merely to complete packaging or infrastructure work;
- may create an explicit wake event that asks the intelligence to perform a harness-defined ritual;
- may protect, back up, restore, and version the files as opaque buyer-owned data.

## Update rule

A product update may ship a new candidate harness release, but it must not merge that release into an active entity automatically.

Harness changes require:

1. a written request describing the customer outcome;
2. review by an intelligence operating through the harness;
3. a backup of the active entity;
4. an explicit operator-approved application step;
5. a provenance record.

## Engineering principle

> Infrastructure handles durability. The harness supplies cognitive orientation. The intelligence performs cognition.

The first-boot mechanism follows the same rule. The OS sees the foundational
integration marker and a plain Markdown reading ledger. While either remains
incomplete, it sends bounded wake events. The intelligence reads, interprets,
writes its own harness, checks each source it actually read, and changes the
marker itself.
