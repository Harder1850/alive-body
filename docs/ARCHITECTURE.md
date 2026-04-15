# Architecture

## Overview

The Body repository interfaces ALIVE with the external world. It handles sensor input and actuator output with safety systems.

## System Role

- Captures external signals (sensors)
- Executes validated actions (actuators)
- Provides firewall protection
- Enforces safety boundaries
- Maintains safe-state operations

## Core Components

### src/
Sensor and actuator interfaces, safety systems, and execution logic.

## Data Flow

```
External → Firewall → Sensors → Runtime → Mind
External ← Firewall ← Actuators ← Runtime ← Mind
```

## Boundaries

- No interpretation of meaning
- No decision-making
- No policy definition
- No cognition

## Interfaces

- Receives: validated actions from Runtime
- Outputs: sensor signals to Runtime, execution logs
- Integrates with: Runtime (receives directions), External world (sensors/actuators)

## Constraints

- May act immediately for safety
- Must not interpret meaning
- All execution logged

## Failure Modes

- Interpretation attempt → boundary violation
- Unauthorized execution → safety breach
- Sensor failure → input loss

## Open Questions

- Specific sensor/actuator implementations
- Emergency protocol details
