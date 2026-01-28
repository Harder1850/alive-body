export type ExecutionReceipt = {
  requestId: string;
  decisionId: string;
  executedAt: number;
  outcome: "SUCCESS" | "FAILURE" | "PARTIAL";
  sideEffectsObserved: string[];
  error?: string;
  authorityUsed: string;
};