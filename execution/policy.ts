import { ExecutionRequest } from "./request";

export type PolicyEvaluationResult = {
  allowed: boolean;
  reason?: string;
};

export type RiskScore = {
  level: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiresSimulation: boolean;
  requiresHumanConfirmation: boolean;
};

export interface ExecutionPolicy {
  evaluate(request: ExecutionRequest): PolicyEvaluationResult;
  scoreRisk(request: ExecutionRequest): RiskScore;
}