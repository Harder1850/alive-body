# Body Architecture

Body is the boundary between ALIVE and the external world.

## Components
- **Nervous System** — firewall, interrupt manager, emergency stop, safe mode
- **Sensors** — ingestion, normalization, filtering, quality scoring
- **Actuators** — executor, command dispatch, reversible actions
- **Autonomic** — health monitoring, resource management, anomaly detection
- **Logging** — execution log, feedback, incident records
- **Adapters** — filesystem, network, devices, external APIs

## Key Invariant
Body NEVER interprets meaning. It carries signals faithfully and executes commands safely.
