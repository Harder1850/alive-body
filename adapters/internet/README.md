# Internet Adapter Interface (Schema-Only)

## Purpose

The Internet Adapter:

- exposes network access as a sense
- treats responses as untrusted input
- routes all activity through execution governance
- produces auditable events, not side effects

The adapter never decides, never stores, never executes beyond the call.

## File layout

```
alive-body/
  adapters/
    internet/
      internetTypes.ts
      internetRequest.ts
      internetResponse.ts
      internetAdapter.ts
      README.md
```

## Internet Capability Declaration

**File**

`adapters/internet/internetTypes.ts`

```ts
export type InternetCapability =
  | 'HTTP_GET'
  | 'HTTP_POST'
  | 'HTTP_PUT'
  | 'HTTP_DELETE'
  | 'WEBSOCKET'
  | 'STREAM';
```

Capabilities are declared, not assumed.

## Internet Request (what is being asked)

**File**

`adapters/internet/internetRequest.ts`

```ts
import { InternetCapability } from './internetTypes';

export type InternetRequest = {
  requestId: string;

  capability: InternetCapability;

  url: string;

  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  headers?: Record<string, string>;

  body?: unknown;

  timeoutMs?: number;

  requestedAt: number;

  /** Execution governance references */
  governance: {
    executionRequestId: string;
    authorityGrantId?: string;
    policyTraceId?: string;
    riskAssessmentId?: string;
    simulationId?: string;
  };
};
```

The adapter does not evaluate governance — it only records references.

## Internet Response (what came back)

**File**

`adapters/internet/internetResponse.ts`

```ts
export type InternetResponse = {
  requestId: string;

  respondedAt: number;

  status: number;

  headers: Record<string, string>;

  body: unknown;

  /** Adapter-level metadata */
  metadata?: {
    bytesReceived?: number;
    durationMs?: number;
    sourceIp?: string;
  };

  /** Trust boundary marker */
  trustLevel: 'UNTRUSTED';
};
```

All internet responses are UNTRUSTED by default.

## Internet Adapter Interface

**File**

`adapters/internet/internetAdapter.ts`

```ts
import { InternetRequest } from './internetRequest';
import { InternetResponse } from './internetResponse';

export interface InternetAdapter {
  /**
   * Performs a network operation after execution approval.
   * No retries, no caching, no interpretation.
   */
  request(req: InternetRequest): Promise<InternetResponse>;
}
```

The adapter assumes approval already occurred.

## Mandatory invariants (documented only)

All implementations must preserve:

- no internet access without ExecutionArbiter approval
- responses are always UNTRUSTED
- adapter does not parse or interpret content
- adapter does not store data
- adapter does not trigger execution
- adapter failures are reported, not hidden

## Example (static request shape)

```json
{
  "requestId": "net-req-123",
  "capability": "HTTP_GET",
  "url": "https://api.example.com/data",
  "method": "GET",
  "requestedAt": 1710000000000,
  "governance": {
    "executionRequestId": "exec-req-456",
    "policyTraceId": "policy-net-read"
  }
}
```

## Biological mapping (sanity check)

| Biology | ALIVE |
| --- | --- |
| Sensory receptor | Internet adapter |
| Thalamic gate | Execution Arbiter |
| Sensory cortex | Core ingestion |
| Hallucination risk | UNTRUSTED marker |

## One-sentence contract

The Internet Adapter senses the world; it does not understand it.