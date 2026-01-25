# ALIVE Body

## Purpose
`alive-body` is the **only execution-capable layer**.

It is intentionally constrained.

## Responsibilities
- Execute authorized actions
- Enforce kill switch
- Write receipts

## Safety Guarantees
- Execution is disabled by default
- Kill switch overrides everything
- All attempts produce receipts
- Action set is closed

## Relationship to ALIVE
- Receives instructions
- Never initiates behavior
- Never thinks
- Never plans

## Canonical Reference
See:
- `alive-core/CONSTITUTIONAL_AUDITS.md`
