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