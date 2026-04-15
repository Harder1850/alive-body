/**
 * Experience Stream — alive-body's append-only perception log.
 *
 * Records every raw Signal the body perceives, in arrival order.
 * This layer captures what the body *saw*, before any firewall or cognition.
 *
 * Storage: alive-body/logs/experience-stream.jsonl  (newline-delimited JSON)
 * The file is append-only — entries are never modified or deleted.
 */

import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Signal } from '../../../alive-constitution/contracts';

const STREAM_DIR  = join(__dirname, '..', '..', 'logs');
const STREAM_PATH = join(STREAM_DIR, 'experience-stream.jsonl');

export function appendSignalToStream(signal: Signal): void {
  try {
    mkdirSync(STREAM_DIR, { recursive: true });
    appendFileSync(STREAM_PATH, JSON.stringify(signal) + '\n', 'utf-8');
  } catch (err) {
    console.error('[experience-stream] Failed to append signal:', err);
  }
}
