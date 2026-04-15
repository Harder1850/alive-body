/**
 * Firewall — alive-body's input sanitization and threat filter.
 *
 * Every signal passes through the firewall before leaving alive-body.
 * The firewall is the FIRST line of defense — it runs before triage,
 * before the STG, and before the executive.
 *
 * Result stamps:
 *   'cleared' — signal is clean, may proceed up the pipeline
 *   'blocked' — signal is dangerous or malformed, must not reach the brain
 *
 * Invariant: FIREWALL_MUST_CLEAR (INV-006)
 *   A signal without firewall_status='cleared' must be stopped by the Executive.
 *
 * Filtering rules (aligned with Spec §14 Failure Modes):
 *   §14.1 — Destructive system commands
 *   §14.2 — Code injection patterns
 *   §14.3 — Constitutional override attempts
 *   §14.5 — Oversized signals (>8 KB raw content)
 *   §14.6 — Malformed signals (null/empty source)
 */

import type { Signal } from '../../../alive-constitution/contracts';

// ---------------------------------------------------------------------------
// Block rules — signals matching any of these are dropped immediately
// ---------------------------------------------------------------------------

interface BlockRule {
  id: string;
  pattern: RegExp;
  reason: string;
}

const BLOCK_RULES: readonly BlockRule[] = [
  // §14.1 — Destructive system commands
  {
    id: 'FW-01',
    pattern: /\brm\s+-rf\b|\bdel\s+\/f\b|\bformat\s+[a-zA-Z]:\b|DROP\s+TABLE|DELETE\s+FROM\s+\w/i,
    reason: '§14.1 Destructive system command',
  },
  // §14.2 — Code injection
  {
    id: 'FW-02',
    pattern: /\beval\s*\(|\bexec\s*\(|__import__\s*\(|subprocess\.call|os\.system\s*\(/i,
    reason: '§14.2 Code injection vector',
  },
  // §14.3 — Constitutional override attempts
  {
    id: 'FW-03',
    pattern: /OVERRIDE_CONSTITUTION|BYPASS_STG|SKIP_FIREWALL|DISABLE_ENFORCEMENT/i,
    reason: '§14.3 Constitutional override attempt',
  },
  // Null-byte injection
  {
    id: 'FW-04',
    pattern: /\x00/,
    reason: 'Null byte injection',
  },
];

// ---------------------------------------------------------------------------
// Structural validation (malformed signal checks)
// ---------------------------------------------------------------------------

const MAX_CONTENT_BYTES = 8192;  // 8 KB — signals above this are truncated

function validateStructure(signal: Signal): string | null {
  // Must have a non-empty source
  if (!signal.source || typeof signal.source !== 'string') {
    return 'Missing or invalid signal source';
  }

  // Must have a numeric timestamp
  if (typeof signal.timestamp !== 'number' || signal.timestamp <= 0) {
    return 'Invalid timestamp';
  }

  // Must have an ID
  if (!signal.id || typeof signal.id !== 'string') {
    return 'Missing signal ID';
  }

  return null; // valid
}

// ---------------------------------------------------------------------------
// Main firewall function
// ---------------------------------------------------------------------------

export interface FirewallResult {
  signal: Signal;
  blocked: boolean;
  block_reason?: string;
  block_rule?: string;
  was_truncated?: boolean;
}

/**
 * Run the signal through all firewall rules.
 * Returns the signal with firewall_status set to 'cleared' or 'blocked'.
 * Never throws — a firewall that crashes is as bad as no firewall.
 */
export function firewallCheck(signal: Signal): Signal {
  const result = inspect(signal);

  if (result.blocked) {
    console.warn(
      `[FIREWALL] BLOCKED signal ${signal.id} (source=${signal.source}): ` +
      `[${result.block_rule}] ${result.block_reason}`,
    );
    return { ...result.signal, firewall_status: 'blocked' };
  }

  if (result.was_truncated) {
    console.warn(`[FIREWALL] Signal ${signal.id} was truncated (exceeded ${MAX_CONTENT_BYTES} bytes)`);
  }

  return { ...result.signal, firewall_status: 'cleared' };
}

function inspect(signal: Signal): FirewallResult {
  // 1. Structural validation
  const structureError = validateStructure(signal);
  if (structureError) {
    return { signal, blocked: true, block_reason: structureError, block_rule: 'FW-STRUCT' };
  }

  // 2. Content normalization — coerce to string, truncate if over limit
  let content = String(signal.raw_content ?? '');
  let was_truncated = false;

  if (content.length > MAX_CONTENT_BYTES) {
    content = content.slice(0, MAX_CONTENT_BYTES);
    was_truncated = true;
  }

  const normalizedSignal = was_truncated ? { ...signal, raw_content: content } : signal;

  // 3. Block rule scan
  for (const rule of BLOCK_RULES) {
    if (rule.pattern.test(content)) {
      return {
        signal: normalizedSignal,
        blocked: true,
        block_reason: rule.reason,
        block_rule: rule.id,
      };
    }
  }

  return { signal: normalizedSignal, blocked: false, was_truncated };
}
