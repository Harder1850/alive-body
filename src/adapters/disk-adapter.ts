/**
 * Disk Space Adapter
 * Reads filesystem sizes for all mounted volumes and emits a Signal with source 'telemetry'.
 * Carry-only: no interpretation, no decisions.
 */

import type { Signal } from '../../../alive-constitution/contracts/signal';
import si from 'systeminformation';
import { BaseAdapter } from './base-adapter';

export interface DiskReading {
  fs: string;
  mount: string;
  size_bytes: number;
  used_bytes: number;
  available_bytes: number;
  use_percent: number;
}

export class DiskAdapter implements BaseAdapter {
  name = 'disk-adapter';

  async send(_command: unknown): Promise<unknown> {
    return null;
  }

  async receive(): Promise<Signal> {
    const volumes = await si.fsSize();
    const readings: DiskReading[] = volumes.map((v) => ({
      fs: v.fs,
      mount: v.mount,
      size_bytes: v.size,
      used_bytes: v.used,
      available_bytes: v.available,
      use_percent: Math.round((v.use ?? 0) * 100) / 100,
    }));

    return {
      id: crypto.randomUUID(),
      source: 'telemetry',
      raw_content: readings,
      timestamp: Date.now(),
      threat_flag: false,
      firewall_status: 'pending',
    };
  }
}
