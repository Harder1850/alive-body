/**
 * Experience Stream — alive-body
 * alive-body/src/logging/execution-log.ts
 *
 * Append-only, immutable record of every signal, STG decision,
 * action executed, and outcome observed.
 *
 * Rules (v16 §7B.5):
 *   - Append-only. No edits. No deletions. No retroactive changes.
 *   - STG decisions are written verbatim as passed by runtime.
 *     Body does NOT infer or synthesize them.
 *   - alive-mind does NOT write to this stream.
 *   - Every write is a single JSON line (JSONL format).
 *
 * File location: alive-body/logs/experience-stream.jsonl
 */

import * as fs   from 'fs';
import * as path from 'path';

// ─── Entry types ──────────────────────────────────────────────────────────────

export type ExperienceEntryKind =
  | 'signal_received'
  | 'stg_decision'
  | 'action_dispatched'
  | 'action_outcome'
  | 'cycle_complete';

export interface ExperienceEntry {
  kind:      ExperienceEntryKind;
  timestamp: number;
  signal_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data:      Record<string, any>;
}

// ─── Log path ─────────────────────────────────────────────────────────────────

const LOG_DIR  = path.resolve(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'experience-stream.jsonl');

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// ─── Core append ─────────────────────────────────────────────────────────────

export function appendToExperienceStream(entry: ExperienceEntry): void {
  try {
    ensureLogDir();
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(LOG_FILE, line, { encoding: 'utf8', flag: 'a' });
  } catch (err) {
    console.error('[EXPERIENCE STREAM] Write failed:', err);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function logSignalReceived(
  signalId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signalData: Record<string, any>,
): void {
  appendToExperienceStream({ kind: 'signal_received', timestamp: Date.now(), signal_id: signalId, data: signalData });
}

export function logStgDecision(
  signalId: string,
  verdict:  'OPEN' | 'DEFER' | 'DENY',
  reason:   string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>,
): void {
  appendToExperienceStream({ kind: 'stg_decision', timestamp: Date.now(), signal_id: signalId, data: { verdict, reason, ...context } });
}

export function logActionDispatched(
  signalId:   string,
  decisionId: string,
  actionType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?:   Record<string, any>,
): void {
  appendToExperienceStream({ kind: 'action_dispatched', timestamp: Date.now(), signal_id: signalId, data: { decision_id: decisionId, action_type: actionType, payload } });
}

export function logActionOutcome(
  signalId:   string,
  decisionId: string,
  success:    boolean,
  detail:     string,
): void {
  appendToExperienceStream({ kind: 'action_outcome', timestamp: Date.now(), signal_id: signalId, data: { decision_id: decisionId, success, detail } });
}

export function logCycleComplete(
  signalId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record:   Record<string, any>,
): void {
  appendToExperienceStream({ kind: 'cycle_complete', timestamp: Date.now(), signal_id: signalId, data: record });
}

export function getExperienceStreamPath(): string {
  return LOG_FILE;
}
