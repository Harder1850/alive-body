/**
 * ACTUATOR EXECUTOR — alive-body
 * src/actuators/executor.ts
 *
 * Final execution gate for all ALIVE actions.
 *
 * Authorization is ALWAYS required — the optional parameter from earlier
 * versions has been removed. Callers must obtain an ActionAuthorization by
 * passing through alive-runtime/enforcement/global-gate.ts before calling
 * this function.
 *
 * Defense-in-depth checks performed here (in addition to global-gate):
 *   1. Shape validation — hasValidAuthorization() verifies all required fields
 *      and approved_by === 'runtime'
 *   2. Action-hash binding — recomputes computeActionHash(action) and checks it
 *      matches authorization.action_hash. Prevents a caller that bypassed the
 *      gate from substituting a different action payload after token issuance.
 *
 * executeActionLegacy() has been deleted. It was a direct bypass.
 */

import type { Action } from '../../../alive-constitution/contracts/action';
import { type ActionAuthorization, hasValidAuthorization, computeActionHash } from '../../../alive-constitution/contracts';
import { logActionDispatched, logActionOutcome } from '../logging/execution-log';
import { writeWebFile } from '../tools/file-manager';

/**
 * Authorization-checked executor result.
 */
export interface ExecutorResult {
  /** True if execution was permitted and completed. */
  readonly executed: boolean;

  /** Result message or error reason. */
  readonly result: string;

  /** The authorization that was validated (present on success and on auth-failure). */
  readonly authorization?: ActionAuthorization;
}

/**
 * Execute an action with mandatory authorization enforcement.
 *
 * Authorization is required on every call. Omitting it is a compile-time error.
 * The caller is responsible for obtaining a valid token from the global gate
 * (alive-runtime/enforcement/global-gate.ts) before calling here.
 *
 * This function performs two defense-in-depth checks even after the gate:
 *   - Shape validation (hasValidAuthorization)
 *   - Action-hash re-verification (prevents payload substitution)
 *
 * @param action        The action to execute.
 * @param authorization Authorization token — must have been issued and consumed
 *                      by the global gate immediately before this call.
 */
export function executeAction(
  action: Action,
  authorization: ActionAuthorization,
): ExecutorResult {
  const signalId   = authorization.signal_id ?? 'executor-unknown';
  const decisionId = `exec-${Date.now()}`;

  // ── Defense-in-depth 1: shape validation ───────────────────────────────────
  if (!hasValidAuthorization(authorization)) {
    const reason =
      'EXECUTION BLOCKED: authorization token failed shape validation. ' +
      'approved_by must be "runtime" and all required fields must be present.';
    logActionDispatched(signalId, decisionId, action.type);
    logActionOutcome(signalId, decisionId, false, reason);
    return { executed: false, result: reason, authorization };
  }

  // ── Defense-in-depth 2: action-hash re-verification ───────────────────────
  // The gate already verified the hash; this re-check prevents a compromised
  // caller from substituting a different action after the gate consumed the token.
  const expectedHash = computeActionHash(action);
  if (authorization.action_hash !== expectedHash) {
    const reason =
      `EXECUTION BLOCKED: action-hash mismatch in executor. ` +
      `token_hash="${authorization.action_hash}" recomputed="${expectedHash}" ` +
      `action="${action.type}". Token was not issued for this exact action payload.`;
    logActionDispatched(signalId, decisionId, action.type);
    logActionOutcome(signalId, decisionId, false, reason);
    console.error(`[EXECUTOR] BLOCKED(hash_mismatch) action="${action.type}"`);
    return { executed: false, result: reason, authorization };
  }

  // ── Execute ─────────────────────────────────────────────────────────────────
  let result: string;

  if (action.type === 'display_text') {
    result = action.payload;
  } else if (action.type === 'write_file') {
    const { success, path, error } = writeWebFile(action.filename, action.content);
    result = success
      ? `FILE_WRITTEN: ${path}`
      : `FILE_WRITE_FAILED: ${error}`;
  } else {
    result = 'Unsupported action type';
  }

  logActionDispatched(signalId, decisionId, action.type);
  logActionOutcome(signalId, decisionId, !result.startsWith('FILE_WRITE_FAILED'), result);

  return { executed: true, result, authorization };
}
