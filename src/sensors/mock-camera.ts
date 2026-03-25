/**
 * Mock Camera Adapter — alive-body sensor.
 *
 * Registers itself with the sensor registry on startup, emitting a
 * NEW_SENSOR_DETECTED signal so alive-mind can index its capabilities.
 */

import { registerSensor } from './sensor-registry';
import type { Signal } from '../../../alive-constitution/contracts/signal';

export const cameraRegistrationSignal: Signal = registerSensor({
  id: 'sensor-camera-01',
  name: 'Camera',
  data_type: 'json',
  unit: 'visual_proximity_alert',
  expected_range: { values: ['clear', 'object_near', 'object_contact', 'obstruction'] },
  description: 'Detects visual proximity of objects; emits alerts when thresholds are crossed.',
});

/**
 * Mock camera read — returns a proximity alert Signal.
 */
export function readCamera(alert: 'clear' | 'object_near' | 'object_contact' | 'obstruction'): Signal {
  const isThreaten = alert === 'object_contact' || alert === 'obstruction';
  return {
    id: crypto.randomUUID(),
    source: 'camera',
    raw_content: { alert },
    timestamp: Date.now(),
    threat_flag: isThreaten,
    firewall_status: 'cleared',
  };
}
