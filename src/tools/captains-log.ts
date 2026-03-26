/**
 * Captain's Log — appends hourly vessel status entries to alive-web/captains-log.json.
 * The log is a JSON array of entries, newest last.
 * The dashboard reads this file directly via fetch().
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { EnvironmentSnapshot } from '../sensors/environment';

const LOG_DIR  = join('C:', 'Users', 'mikeh', 'dev', 'ALIVE', 'alive-repos', 'alive-web');
const LOG_PATH = join(LOG_DIR, 'captains-log.json');
const MAX_ENTRIES = 168; // keep 7 days of hourly entries

export interface LogEntry {
  ts: string;          // ISO timestamp
  epoch: number;
  summary: string;
  mode: 'NOMINAL' | 'SURVIVAL';
  battery: number;
  windMph: number;
  cpuTempC: number;
  weather: string;
}

export function appendLogEntry(env: EnvironmentSnapshot, summary: string): void {
  mkdirSync(LOG_DIR, { recursive: true });

  let entries: LogEntry[] = [];
  if (existsSync(LOG_PATH)) {
    try {
      entries = JSON.parse(readFileSync(LOG_PATH, 'utf-8')) as LogEntry[];
    } catch { /* start fresh on corrupt file */ }
  }

  const entry: LogEntry = {
    ts:       new Date(env.timestamp).toISOString(),
    epoch:    env.timestamp,
    summary,
    mode:     env.survivalMode ? 'SURVIVAL' : 'NOMINAL',
    battery:  env.battery.percent,
    windMph:  env.weather.windspeedMph,
    cpuTempC: env.cpu.tempC,
    weather:  env.weather.description,
  };

  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES);

  writeFileSync(LOG_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  console.log(`[captains-log] ✓ Entry appended: "${summary}"`);
}
