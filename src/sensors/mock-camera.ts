/**
 * Mock Camera Adapter — alive-body sensor.
 *
 * Registers itself with the sensor registry on startup, emitting a
 * NEW_SENSOR_DETECTED signal so alive-mind can index its capabilities.
 */

import { registerSensor } from './sensor-registry';
import { makeSignal, type Signal } from '../../../alive-constitution/contracts';

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
  return makeSignal({
    id: crypto.randomUUID(),
    source: 'camera',
    kind: 'file_change_event',
    raw_content: { alert },
    payload: { alert },
    timestamp: Date.now(),
    urgency: isThreaten ? 0.95 : 0.3,
    confidence: 0.9,
    quality_score: 0.9,
    threat_flag: isThreaten,
    firewall_status: 'cleared',
  });
}
