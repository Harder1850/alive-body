import { ExecutionDecision } from "./decision";

export interface ExecutionReceipt {
  decision: ExecutionDecision;
  executionResult?: unknown;
  timestamp: number;
}