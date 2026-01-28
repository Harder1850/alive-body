import { ExecutionRequest } from "./request";
import { ExecutionDecision } from "./decision";

export interface ExecutionArbiter {
  evaluate(request: ExecutionRequest): ExecutionDecision;
}