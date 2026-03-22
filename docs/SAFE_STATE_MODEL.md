# Safe State Model

## States
- **Normal**: full operation
- **Safe Mode**: reduced operation, non-critical actuators disabled
- **Hibernate-Safe**: preserve state, minimal activity, await recovery
- **Emergency Stop**: all actuators halted immediately

## Transitions
Normal → Safe Mode: triggered by Runtime or autonomic anomaly
Safe Mode → Hibernate-Safe: prolonged anomaly or instruction
Any → Emergency Stop: critical violation or emergency signal
Emergency Stop → Normal: only via explicit Recovery sequence

## Constitution Guarantee
`SAFE_STATE_ALWAYS_REACHABLE = true`
