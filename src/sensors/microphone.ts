/**
 * Microphone Adapter — Mock sensor for alive-body.
 *
 * Registers itself with the sensor registry on startup, emitting a
 * NEW_SENSOR_DETECTED signal so alive-mind can index its capabilities.
 */

import { registerSensor } from './sensor-registry';
import type { Signal } from '../../../alive-constitution/contracts/signal';

export const microphoneRegistrationSignal: Signal = registerSensor({
  id: 'sensor-microphone-01',
  name: 'Microphone',
  data_type: 'string',
  unit: 'text',
  expected_range: { values: ['transcript', 'silence', 'noise'] },
  description: 'Converts ambient audio to text transcriptions for language processing.',
});

/**
 * Mock microphone read — returns a text transcript Signal.
 */
export function readMicrophone(transcript: string): Signal {
  return {
    id: crypto.randomUUID(),
    source: 'microphone',
    raw_content: transcript,
    timestamp: Date.now(),
    threat_flag: false,
    firewall_status: 'pending',
  };
}
