/**
 * CPU Monitor Adapter — alive-body
 * alive-body/src/adapters/cpu-monitor.ts
 *
 * Body execution module. Imports contracts from alive-constitution only.
 * Does NOT interpret meaning, evaluate goals, or make decisions.
 * Reads CPU utilization from the OS and emits a typed Signal.
 *
 * Classification is structural only:
 *   - kind = 'cpu_utilization' because the data shape is a CPU percentage
 *   - urgency is computed from the raw value against fixed thresholds
 *   - body does NOT decide whether high CPU is a problem — that is runtime/mind
 *
 * v16 §31.4 — Slice 1 seed sensor
 */

import * as os from 'os';
import { makeSignal } from '../../../alive-constitution/contracts/signal';
import type { Signal } from '../../../alive-constitution/contracts/signal';

// ─── Thresholds (structural — not semantic) ───────────────────────────────────

const URGENCY_HIGH_THRESHOLD = 0.80;
const URGENCY_MED_THRESHOLD  = 0.60;
const URGENCY_LOW_THRESHOLD  = 0.40;

// ─── CPU measurement ─────────────────────────────────────────────────────────

interface CpuSample {
  usagePercent: number;
  coreCount: number;
}

function measureCpu(): Promise<CpuSample> {
  return new Promise((resolve) => {
    const cpusBefore = os.cpus();

    setTimeout(() => {
      const cpusAfter = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;

      for (let i = 0; i < cpusBefore.length; i++) {
        const before = cpusBefore[i].times;
        const after  = cpusAfter[i].times;

        const idleDelta  = after.idle  - before.idle;
        const totalDelta =
          (after.user   - before.user)   +
          (after.nice   - before.nice)   +
          (after.sys    - before.sys)    +
          (after.irq    - before.irq)    +
          idleDelta;

        totalIdle += idleDelta;
        totalTick += totalDelta;
      }

      const idlePercent  = totalTick > 0 ? (totalIdle / totalTick) * 100 : 100;
      const usagePercent = 100 - idlePercent;

      resolve({ usagePercent, coreCount: cpusBefore.length });
    }, 100);
  });
}

// ─── Urgency computation ──────────────────────────────────────────────────────

function computeUrgency(cpuRisk: number): number {
  if (cpuRisk >= URGENCY_HIGH_THRESHOLD) return 1.0;
  if (cpuRisk >= URGENCY_MED_THRESHOLD)  return 0.7;
  if (cpuRisk >= URGENCY_LOW_THRESHOLD)  return 0.4;
  return 0.1;
}

// ─── Public adapter function ──────────────────────────────────────────────────

export async function readCpuSignal(): Promise<Signal> {
  const { usagePercent, coreCount } = await measureCpu();

  const cpuRisk  = usagePercent / 100;
  const urgency  = computeUrgency(cpuRisk);
  const signalId = crypto.randomUUID().slice(0, 8);

  return makeSignal({
    id:            signalId,
    source:        'telemetry',
    kind:          'cpu_utilization',
    raw_content:   `cpu_usage=${usagePercent.toFixed(2)}%`,
    urgency,
    confidence:    1.0,
    quality_score: 1.0,
    payload: {
      usage_percent: parseFloat(usagePercent.toFixed(4)),
      cpu_risk:      parseFloat(cpuRisk.toFixed(4)),
      core_count:    coreCount,
    },
  });
}
