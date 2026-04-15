# ALIVE Body

## Commitment

This repository interfaces ALIVE with the external world.

It is responsible for:
- input ingestion (signals)
- output execution (actuators)
- safety systems and firewalling
- execution logging
- safe-state control

It may act immediately for safety.

It does not:
- interpret meaning
- make decisions
- perform reasoning
- define or enforce policy

Body executes. It does not think.

## Architecture Spine

Constitution defines → Runtime governs → Mind thinks → Body acts → Interface displays

## Purpose
Sensorimotor and safety layer. Interfaces with the external world and enforces boundary protection.

## Responsibilities
- Sensors and input capture
- Pre-filtering and normalization
- Actuator execution
- External firewall (input/output)
- Emergency shutdown
- Safe mode / hibernate-safe
- Logging

## Safety Systems
- **Firewall**: blocks unsafe input/output
- **Emergency Stop**: immediate halt
- **Safe Mode**: reduced operation
- **Hibernate-Safe**: preserve state

## Rules
- May act immediately for safety
- Must NOT interpret meaning
- Must NOT make decisions

## Control Flow
```
Outside → Firewall → Sensors → Runtime/Mind
Mind/Runtime → Firewall → Actuators → Outside
```

## Non-Scope
- No cognition
- No decision-making
- No memory management
- No policy definition

## Drift Warning
⚠️ If this layer makes decisions, architecture integrity is lost.

## Documentation Standard

This repository follows the ALIVE documentation templates defined in:

alive-constitution/docs/standards/TEMPLATES.md
