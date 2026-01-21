# Phase 32 — Execution Under Explicit Authority

This module performs execution only when explicitly authorized.

## Requirements
- Kill switch enabled
- Valid authorization file
- Registered action

## Guarantees
- No autonomous execution
- Full audit trail
- Immediate shutdown via kill switch
- Removal deletes all execution capability

Phase 32 does not interpret or decide.

## How to Run (Manual Only)

### Enable execution
Edit `phase-32/kill-switch.json` → "enabled": true

### Run execution
node phase-32/execute.ts

Disable execution instantly by setting:
{ "enabled": false }

## Failure Modes

For each failure mode below:

**Execution is blocked; receipt is written.**

### expired authorization

Execution is blocked; receipt is written.

### invalid authority

Execution is blocked; receipt is written.

### kill switch engaged

Execution is blocked; receipt is written.

### unregistered action

Execution is blocked; receipt is written.

## Constitutional Oversight

Execution authority and boundaries are verified by the system-wide audit:
`alive-core/CONSTITUTIONAL_AUDITS.md`
