# Policy Evaluation Trace Schema

The Policy Evaluation Trace exists to:

- make decisions auditable
- preserve reasoning transparency
- prevent silent approvals or denials
- support replay, inspection, and debugging
- ensure policies never become invisible power

A trace:

- records what was checked
- records what was considered
- records what blocked or allowed
- never changes outcomes by itself

## File layout

```
alive-body/
  policy/
    policyTypes.ts
    policyCheck.ts
    policyTrace.ts
    README.md
```

## Policy Type

**File:** `policy/policyTypes.ts`

```ts
export type PolicyKind =
  | 'SAFETY'
  | 'SECURITY'
  | 'LEGAL'
  | 'ETHICAL'
  | 'OPERATIONAL'
  | 'CUSTOM';
```

## Policy Check (atomic evaluation record)

**File:** `policy/policyCheck.ts`

```ts
import { PolicyKind } from './policyTypes';

export type PolicyCheck = {
  policyId: string;

  kind: PolicyKind;

  description: string;

  /** Result of this check */
  outcome: 'PASS' | 'FAIL' | 'WARN' | 'UNKNOWN';

  /** Optional explanation */
  rationale?: string;

  /** Whether this check is mandatory */
  required: boolean;
};
```

## Policy Evaluation Trace (bundle)

**File:** `policy/policyTrace.ts`

```ts
import { PolicyCheck } from './policyCheck';

export type PolicyEvaluationTrace = {
  traceId: string;

  targetAction: string;

  evaluatedAt: number;

  checks: PolicyCheck[];

  /** Overall evaluation outcome */
  overallOutcome: 'ALLOW' | 'DENY' | 'REQUIRES_REVIEW';

  /** Whether human confirmation is required */
  requiresHuman?: boolean;

  notes?: string;
};

export type PolicyClaim = {
  claimedTraceId: string;
  claimedOutcome: 'ALLOW' | 'DENY' | 'REQUIRES_REVIEW';
};
```

## Policy Claim (execution linkage)

Claims are assertions only.

## Mandatory invariants (documented only)

All implementations must preserve:

- every execution decision must reference a trace
- failed required checks cannot be ignored
- warnings cannot be auto-suppressed
- missing policy data → REQUIRES_REVIEW
- policy traces are append-only
- core does not evaluate policy

## Example (static policy trace)

```json
{
  "traceId": "policy-file-delete-prod",
  "targetAction": "FILE_DELETE",
  "evaluatedAt": 1710000000000,
  "checks": [
    {
      "policyId": "no-delete-prod",
      "kind": "SAFETY",
      "description": "Prevent destructive actions in production",
      "outcome": "FAIL",
      "required": true,
      "rationale": "Production environment protected"
    }
  ],
  "overallOutcome": "DENY",
  "requiresHuman": true
}
```

## Biological mapping (sanity check)

| Biology | ALIVE |
| --- | --- |
| Inhibitory control | Policy checks |
| Moral reasoning | Ethical policy |
| Error monitoring | Anterior cingulate |
| Executive veto | Overall outcome |

## One-sentence contract

Policy traces explain decisions; they never silently decide them.