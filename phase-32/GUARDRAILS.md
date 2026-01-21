# Phase 32 Guardrails — Execution Under Explicit Authority

Phase 32 permits execution only under explicit, external authorization.

Execution is forbidden unless:
- an authorization file exists
- authority is validated
- the action is registered
- the kill switch is disabled

Phase 32 does not decide what to do.
It only performs what has been authorized.

Deleting Phase 32 must immediately remove execution capability.

## Revocation & Failure Semantics

Kill-switch precedence is always highest.

If any guardrail check fails, execution is forbidden and must not occur.

### Authority expiration behavior

- If authorization is expired at invocation time, execution is blocked.
- Expired authorizations must never be treated as valid by fallback logic.

### Mid-execution revocation behavior

- If authorization becomes invalid during execution, execution must not proceed further.
- Phase 32 must not retry, defer, or “continue anyway.”

### Guaranteed non-execution on failure

- On failure (kill switch, invalid authority, unregistered action, expired authorization), the system must not execute any action.
