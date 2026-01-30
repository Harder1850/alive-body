/**
 * ALIVE Voice Adapters
 * 
 * Registers voice.stt and voice.mic capabilities.
 * ALIVE decides whether to use them.
 */

export { transcribeOnce, capability as sttCapability } from './stt.js';
export { captureOnce, capability as micCapability } from './mic.js';

// Export all capabilities for registration
export const capabilities = [
  {
    id: 'voice.stt',
    name: 'Speech-to-Text (Local Whisper)',
    description: 'Transcribes audio to text using local Whisper installation',
    requires: ['whisper'],
    offline: true
  },
  {
    id: 'voice.mic',
    name: 'Microphone Capture',
    description: 'Captures audio from system microphone',
    requires: ['microphone'],
    offline: true
  }
];

export default { capabilities };
