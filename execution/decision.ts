export type ExecutionDecision =
  | DenyDecision
  | DeferDecision
  | SimulateDecision
  | RequestConfirmationDecision
  | ApproveDecision;

type BaseDecision = {
  requestId: string;
  decidedAt: number;
  decidedBy: "EXECUTION_ARBITER";
  rationale: string[];
};

export type DenyDecision = BaseDecision & {
  kind: "DENY";
  reasonCodes: string[];
};

export type DeferDecision = BaseDecision & {
  kind: "DEFER";
  retryAfter?: number;
};

export type SimulateDecision = BaseDecision & {
  kind: "SIMULATE";
  simulationScope: string;
};

export type RequestConfirmationDecision = BaseDecision & {
  kind: "REQUEST_CONFIRMATION";
  confirmationRequiredFrom: "HUMAN";
};

export type ApproveDecision = BaseDecision & {
  kind: "APPROVE";
  executionConstraints: ExecutionConstraints;
};

export type ExecutionConstraints = {
  maxDurationMs?: number;
  maxRetries?: number;
  allowedSideEffects: string[];
};