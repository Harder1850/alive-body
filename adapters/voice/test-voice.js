#!/usr/bin/env node

/**
 * ALIVE Voice Adapter Test Script
 * 
 * Proves: mic → stt → text
 * 
 * Must be manually invoked. Prints transcription. Exits cleanly.
 * NOT part of runtime.
 * 
 * Usage: node test-voice.js [duration_seconds]
 */

import { captureOnce } from './mic.js';
import { transcribeOnce } from './stt.js';

const duration = parseInt(process.argv[2]) || 5;

console.log(`[test-voice] Recording for ${duration} seconds...`);
console.log('[test-voice] Speak now.\n');

try {
  // Step 1: Capture mic audio
  const { audioBuffer, sampleRate } = await captureOnce({ duration });
  console.log(`[test-voice] Captured ${audioBuffer.length} bytes at ${sampleRate}Hz`);

  // Step 2: Transcribe
  console.log('[test-voice] Transcribing...\n');
  const result = await transcribeOnce({ audioBuffer });

  // Step 3: Output
  console.log('='.repeat(50));
  console.log('TRANSCRIPTION:');
  console.log(result.text);
  console.log('='.repeat(50));
  
  if (result.language) {
    console.log(`Language: ${result.language}`);
  }
  if (result.confidence !== null) {
    console.log(`Confidence: ${result.confidence}`);
  }

  console.log('\n[test-voice] Done.');
  process.exit(0);

} catch (err) {
  console.error(`[test-voice] ERROR: ${err.message}`);
  process.exit(1);
}
