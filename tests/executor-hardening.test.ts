/**
 * EXECUTOR HARDENING TESTS — alive-body
 * tests/executor-hardening.test.ts
 *
 * Verifies the audit-cycle hardening applied to executor.ts:
 *   - executeActionLegacy() no longer exists
 *   - executeAction() requires authorization (compile-time enforced)
 *   - Forged token (approved_by !== 'runtime') is rejected
 *   - Action-hash mismatch in executor is rejected (defense-in-depth)
 *   - Valid authorization passes through and executes
 *
 * Run with: node --import tsx --test tests/executor-hardening.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { Action }              from '../alive-constitution/contracts/action';
import type { ActionAuthorization } from '../alive-constitution/contracts/authorized-action';
import { computeActionHash }        from '../alive-constitution/contracts/authorized-action';
import { executeAction }            from './src/actuators/executor';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeValidAuth(action: Action, overrides?: Partial<ActionAuthorization>): ActionAuthorization {
  return {
    authorization_id: `auth-test-${Math.random().toString(36).slice(2)}`,
    approved_by:      'runtime',
    approved_at:      Date.now(),
    expires_at:       Date.now() + 30_000,
    action_hash:      computeActionHash(action),
    signal_id:        'sig-test',
    ...overrides,
  };
}

const DISPLAY_ACTION: Action = { type: 'display_text', payload: 'hello world' };

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Executor hardening — audit cycle fixes', () => {

  it('EH1: executeActionLegacy does not exist (deleted)', () => {
    // If this import resolves, the function must not exist on the module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const executorModule = require('./src/actuators/executor') as Record<string, unknown>;
    assert.equal(
      typeof executorModule['executeActionLegacy'],
      'undefined',
      'executeActionLegacy must have been deleted — it was a direct bypass',
    );
  });

  it('EH2: valid authorization passes and executes the action', () => {
    const auth = makeValidAuth(DISPLAY_ACTION);
    const result = executeAction(DISPLAY_ACTION, auth);

    assert.equal(result.executed, true, 'Must execute with valid auth');
    assert.equal(result.result, 'hello world', 'display_text payload must be returned');
  });

  it('EH3: forged token (approved_by !== "runtime") is rejected by executor', () => {
    const forgedAuth = makeValidAuth(DISPLAY_ACTION, { approved_by: 'manual' as never });
    const result = executeAction(DISPLAY_ACTION, forgedAuth);

    assert.equal(result.executed, false, 'Must block forged token');
    assert.match(result.result, /EXECUTION BLOCKED/, 'Result must describe the block');
  });

  it('EH4: action-hash mismatch in executor is rejected (defense-in-depth)', () => {
    const originalAction: Action  = { type: 'display_text', payload: 'original payload' };
    const substitutedAction: Action = { type: 'display_text', payload: 'INJECTED payload' };

    // Token was issued for originalAction but executor receives substitutedAction.
    const auth = makeValidAuth(originalAction);
    const result = executeAction(substitutedAction, auth);

    assert.equal(result.executed, false, 'Payload substitution after token issuance must fail');
    assert.match(
      result.result,
      /hash_mismatch|action-hash mismatch/i,
      'Failure reason must mention hash mismatch',
    );
  });

  it('EH5: missing authorization_id in token fails shape validation', () => {
    const badAuth = makeValidAuth(DISPLAY_ACTION, { authorization_id: '' as never });
    const result = executeAction(DISPLAY_ACTION, badAuth);

    assert.equal(result.executed, false);
    assert.match(result.result, /EXECUTION BLOCKED/);
  });

  it('EH6: action hash is SHA-256 (64-char hex), not FNV-1a (8-char)', () => {
    const hash = computeActionHash(DISPLAY_ACTION);
    assert.equal(hash.length, 64, 'SHA-256 digest must be 64 hex chars');
    assert.match(hash, /^[0-9a-f]{64}$/, 'Hash must be lowercase hex');
    assert.notMatch(hash, /^[0-9a-f]{8}$/, 'Must NOT be 8-char FNV-1a');
  });

  it('EH7: hash is deterministic — same action always produces same hash', () => {
    const h1 = computeActionHash(DISPLAY_ACTION);
    const h2 = computeActionHash(DISPLAY_ACTION);
    assert.equal(h1, h2, 'Hash must be deterministic');
  });

  it('EH8: different actions produce different hashes', () => {
    const otherAction: Action = { type: 'display_text', payload: 'different' };
    const h1 = computeActionHash(DISPLAY_ACTION);
    const h2 = computeActionHash(otherAction);
    assert.notEqual(h1, h2, 'Different payloads must produce different hashes');
  });

});
