# Human Confirmation Schema (Authoritative)

## Purpose

Human Confirmation exists to:

- require explicit, conscious consent for sensitive actions
- prevent implicit or inferred approval
- bound approval by scope, time, and intent
- provide non-repudiable auditability

Human confirmation:

- is always opt-in
- expires
- cannot be reused silently
- cannot be simulated
- overrides automation escalation paths

## File layout

```
alive-body/
  human/
    confirmationTypes.ts
    confirmationRequest.ts
    confirmationResponse.ts
    confirmationClaim.ts
    README.md
```

## Confirmation Mode

**File**

`human/confirmationTypes.ts`

```ts
export type ConfirmationMode =
  | 'EXPLICIT_APPROVAL'
  | 'TWO_STEP_APPROVAL'
  | 'OUT_OF_BAND'
  | 'EMERGENCY_OVERRIDE';
```

Modes describe how confirmation was obtained, not its validity.

## Confirmation Request

**File**

`human/confirmationRequest.ts`

```ts
import { ConfirmationMode } from './confirmationTypes';

export type ConfirmationRequest = {
  requestId: string;

  requestedAt: number;

  requestedBy:
    | { kind: 'SYSTEM'; systemId: string }
    | { kind: 'SERVICE'; serviceId: string };

  targetAction: string;

  summary: string;

  mode: ConfirmationMode;

  /** Human-readable explanation of consequences */
  consequences: string;

  /** Hard expiry for confirmation */
  expiresAt: number;

  /** Scope bound to this request */
  scope?: {
    actionTypes: string[];
    environments?: string[];
  };
};
```

## Confirmation Response

**File**

`human/confirmationResponse.ts`

```ts
import { ConfirmationMode } from './confirmationTypes';

export type ConfirmationResponse = {
  responseId: string;

  requestId: string;

  respondedAt: number;

  responder:
    | { kind: 'HUMAN'; humanId: string };

  decision: 'APPROVE' | 'DENY';

  mode: ConfirmationMode;

  /** Optional justification */
  notes?: string;
};
```

## Confirmation Claim (execution linkage)

```ts
export type ConfirmationClaim = {
  claimedRequestId: string;
  claimedResponseId: string;
};
```

Claims are assertions, not proof.

## Mandatory invariants (documented only)

All implementations must preserve:

- confirmation must be explicit
- expired confirmations are invalid
- confirmation applies to exact scope only
- confirmation cannot widen authority
- emergency override must be logged
- core cannot request or interpret confirmation

## Example (static confirmation)

```json
{
  "responseId": "resp-approve-delete",
  "requestId": "req-confirm-delete",
  "respondedAt": 1710000005000,
  "responder": { "kind": "HUMAN", "humanId": "alice" },
  "decision": "APPROVE",
  "mode": "EXPLICIT_APPROVAL",
  "notes": "Approved after reviewing backup status"
}
```

## Biological mapping (sanity check)

| Biology | ALIVE |
| --- | --- |
| Conscious intent | Human confirmation |
| Volition | Explicit approval |
| Moral agency | Human decision |
| Veto | Denial |

## One-sentence contract

No irreversible action without conscious human intent.

## What is now complete

With this schema added, alive-body’s governance layer is structurally complete:

- Authority
- Risk
- Simulation
- Policy trace
- Audit
- Human confirmation

All without execution logic.