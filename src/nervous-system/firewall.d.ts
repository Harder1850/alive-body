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
import type { Signal } from '../../../alive-constitution/contracts/signal';
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
export declare function firewallCheck(signal: Signal): Signal;
//# sourceMappingURL=firewall.d.ts.map