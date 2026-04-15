/**
 * Microphone Adapter — Mock sensor for alive-body.
 *
 * Registers itself with the sensor registry on startup, emitting a
 * NEW_SENSOR_DETECTED signal so alive-mind can index its capabilities.
 */

import { registerSensor } from './sensor-registry';
import { makeSignal, type Signal } from '../../../alive-constitution/contracts';

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
  return makeSignal({
    id: crypto.randomUUID(),
    source: 'microphone',
    kind: 'user_input',
    raw_content: transcript,
    payload: { transcript },
    timestamp: Date.now(),
    urgency: 0.4,
    confidence: 0.9,
    quality_score: 0.9,
    threat_flag: false,
    firewall_status: 'pending',
  });
}
