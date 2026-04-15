/**
 * CPU Utilization Adapter
 * Reads current CPU load and emits a Signal with source 'telemetry'.
 * Carry-only: no interpretation, no decisions.
 */

import { makeSignal, type Signal } from '../../../alive-constitution/contracts';
import si from 'systeminformation';
import { BaseAdapter } from './base-adapter';

export interface CpuReading {
  usage_percent: number;
  core_count: number;
}

export class CpuAdapter implements BaseAdapter {
  name = 'cpu-adapter';

  async send(_command: unknown): Promise<unknown> {
    return null;
  }

  async receive(): Promise<Signal> {
    const load = await si.currentLoad();
    const reading: CpuReading = {
      usage_percent: Math.round((load.currentLoad ?? 0) * 100) / 100,
      core_count: load.cpus?.length ?? 0,
    };

    return makeSignal({
      id: crypto.randomUUID(),
      source: 'telemetry',
      kind: 'cpu_utilization',
      raw_content: reading,
      payload: {
        usage_percent: reading.usage_percent,
        core_count: reading.core_count,
        cpu_risk: Math.min(1, reading.usage_percent / 100),
      },
      timestamp: Date.now(),
      urgency: Math.min(1, reading.usage_percent / 100),
      confidence: 0.95,
      quality_score: 0.95,
      threat_flag: false,
      firewall_status: 'pending',
    });
  }
}
