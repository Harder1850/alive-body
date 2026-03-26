/**
 * System Info Sensor — reads host hardware state.
 *
 * Uses the 'systeminformation' library to read battery level and charging
 * status. Returns a structured reading the runtime can act on directly,
 * without needing to pass it through the full signal pipeline.
 */

import si from 'systeminformation';

export interface BatteryReading {
  percent: number;
  isCharging: boolean;
  hasBattery: boolean;
}

export async function readBattery(): Promise<BatteryReading> {
  try {
    const data = await si.battery();
    return {
      percent: data.percent ?? 100,
      isCharging: data.isCharging ?? true,
      hasBattery: data.hasBattery ?? false,
    };
  } catch {
    // If we can't read the battery (e.g. desktop with no battery), treat as full
    return { percent: 100, isCharging: true, hasBattery: false };
  }
}
