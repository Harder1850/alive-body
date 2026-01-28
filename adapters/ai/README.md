# External AI Adapter Interface (Schema-Only)

## Purpose

External AI adapters:

- provide advisory text or signals
- are non-authoritative
- are explicitly untrusted
- operate only after execution approval
- never execute tools or actions

## File layout

```
alive-body/
  adapters/
    ai/
      aiTypes.ts
      aiRequest.ts
      aiResponse.ts
      aiAdapter.ts
      README.md
```

## AI Capability Declaration

**File**

`adapters/ai/aiTypes.ts`

```ts
export type AICapability =
  | 'TEXT_COMPLETION'
  | 'CHAT_COMPLETION'
  | 'EMBEDDING'
  | 'CLASSIFICATION'
  | 'SUMMARIZATION';
```

Capabilities are declared, not inferred.

## AI Model Descriptor

```ts
export type AIModelDescriptor = {
  provider: 'OPENAI' | 'LOCAL' | 'CUSTOM';
  modelId: string;
  version?: string;
  locality: 'REMOTE' | 'LOCAL';
};
```

## AI Request (what is being asked)

**File**

`adapters/ai/aiRequest.ts`

```ts
import { AICapability, AIModelDescriptor } from './aiTypes';

export type AIRequest = {
  requestId: string;

  capability: AICapability;

  model: AIModelDescriptor;

  /** Input content (opaque to body) */
  input: unknown;

  /** Optional generation bounds */
  constraints?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  };

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

The adapter records governance references; it does not evaluate them.

## AI Response (what came back)

**File**

`adapters/ai/aiResponse.ts`

```ts
export type AIResponse = {
  requestId: string;

  respondedAt: number;

  output: unknown;

  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };

  /** Explicit uncertainty + trust boundary */
  trust: {
    level: 'UNTRUSTED';
    modelConfidence?: number;
  };

  metadata?: {
    latencyMs?: number;
    providerRequestId?: string;
  };
};
```

All AI output is UNTRUSTED by default.

## External AI Adapter Interface

**File**

`adapters/ai/aiAdapter.ts`

```ts
import { AIRequest } from './aiRequest';
import { AIResponse } from './aiResponse';

export interface ExternalAIAdapter {
  /**
   * Performs an AI inference after execution approval.
   * No tool calls, no memory writes, no side effects.
   */
  infer(req: AIRequest): Promise<AIResponse>;
}
```

## Mandatory invariants (documented only)

All implementations must preserve:

- no AI calls without ExecutionArbiter approval
- AI output is always UNTRUSTED
- adapters do not call tools or trigger execution
- adapters do not store memory
- adapters do not interpret or rank responses
- failures are surfaced, not retried silently

## Example (static request shape)

```json
{
  "requestId": "ai-req-789",
  "capability": "CHAT_COMPLETION",
  "model": {
    "provider": "OPENAI",
    "modelId": "gpt-4.1",
    "locality": "REMOTE"
  },
  "input": {
    "messages": [
      { "role": "user", "content": "Summarize the document." }
    ]
  },
  "requestedAt": 1710000000000,
  "governance": {
    "executionRequestId": "exec-req-456",
    "policyTraceId": "policy-ai-read"
  }
}
```

## Biological mapping (sanity check)

| Biology | ALIVE |
| --- | --- |
| External stimulus | AI output |
| Sensory noise | Hallucination risk |
| Thalamic gate | Execution Arbiter |
| Cortex | Core reasoning |

## One-sentence contract

External AI informs ALIVE; it never becomes ALIVE.