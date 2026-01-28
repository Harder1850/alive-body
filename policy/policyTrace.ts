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