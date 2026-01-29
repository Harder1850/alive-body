import { ExecutionArbiter } from "./arbiter";
import { ArbiterContext } from "./context";
import { ExecutionRequest } from "./request";
import { ExecutionDecision } from "./decision";
import { ExecutionReceipt } from "./receipt";

export class DefaultExecutionArbiter implements ExecutionArbiter {
  async evaluate(
    request: ExecutionRequest,
    ctx: ArbiterContext
  ): Promise<ExecutionDecision> {
    const policyResult = ctx.policy.evaluate(request);
    if (!policyResult.allowed) {
      return {
        kind: "DENY",
        requestId: request.requestId,
        decidedAt: ctx.now,
        decidedBy: "EXECUTION_ARBITER",
        rationale: [policyResult.reason ?? "POLICY_DENY"],
        reasonCodes: [policyResult.reason ?? "POLICY_DENY"],
      };
    }

    const authorityResult = ctx.authority.check(request);
    if (!authorityResult.granted) {
      return {
        kind: "DENY",
        requestId: request.requestId,
        decidedAt: ctx.now,
        decidedBy: "EXECUTION_ARBITER",
        rationale: [authorityResult.reason ?? "AUTHORITY_VIOLATION"],
        reasonCodes: [authorityResult.reason ?? "AUTHORITY_VIOLATION"],
      };
    }

    const risk = ctx.policy.scoreRisk(request);

    if (risk.requiresSimulation) {
      return {
        kind: "SIMULATE",
        requestId: request.requestId,
        decidedAt: ctx.now,
        decidedBy: "EXECUTION_ARBITER",
        rationale: ["SIMULATION_REQUIRED"],
        simulationScope: risk.level,
      };
    }

    if (risk.requiresHumanConfirmation) {
      return {
        kind: "REQUEST_CONFIRMATION",
        requestId: request.requestId,
        decidedAt: ctx.now,
        decidedBy: "EXECUTION_ARBITER",
        rationale: ["HUMAN_CONFIRMATION_REQUIRED"],
        confirmationRequiredFrom: "HUMAN",
      };
    }

    return {
      kind: "APPROVE",
      requestId: request.requestId,
      decidedAt: ctx.now,
      decidedBy: "EXECUTION_ARBITER",
      rationale: ["POLICY_OK", "AUTHORITY_OK", `RISK_${risk.level}`],
      executionConstraints: {
        allowedSideEffects: [],
      },
    };
  }

  finalize(
    decision: ExecutionDecision,
    executionResult?: unknown
  ): ExecutionReceipt {
    return {
      decision,
      executionResult,
      timestamp: Date.now(),
    };
  }
}