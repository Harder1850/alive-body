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