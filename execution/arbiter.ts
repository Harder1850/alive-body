import { ExecutionRequest } from "./request";
import { ExecutionDecision } from "./decision";
import { ExecutionReceipt } from "./receipt";
import { ArbiterContext } from "./context";

export interface ExecutionArbiter {
  evaluate(
    request: ExecutionRequest,
    context: ArbiterContext
  ): Promise<ExecutionDecision>;

  finalize(
    decision: ExecutionDecision,
    executionResult?: unknown
  ): ExecutionReceipt;
}