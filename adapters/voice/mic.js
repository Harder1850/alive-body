/**
 * ALIVE Microphone Capture Adapter
 * 
 * Pure IO - captures audio once, returns buffer.
 * No continuous listening. No background recording.
 * 
 * Body may ACT but not DECIDE.
 */

import { spawn } from 'child_process';
import { platform } from 'os';

// Capability registration
export const capability = {
  id: 'voice.mic',
  name: 'Microphone Capture',
  description: 'Captures audio from system microphone',
  requires: ['microphone'],
  offline: true
};

const DEFAULT_SAMPLE_RATE = 16000;
const DEFAULT_CHANNELS = 1;
const DEFAULT_DURATION = 5; // seconds

/**
 * Capture audio from microphone once
 * @param {Object} [options]
 * @param {number} [options.duration=5] - Recording duration in seconds
 * @param {number} [options.sampleRate=16000] - Sample rate
 * @returns {Promise<{audioBuffer: Buffer, sampleRate: number}>}
 */
export async function captureOnce(options = {}) {
  const {
    duration = DEFAULT_DURATION,
    sampleRate = DEFAULT_SAMPLE_RATE
  } = options;

  if (duration <= 0 || duration > 60) {
    throw new Error('mic: duration must be 1-60 seconds');
  }

  const os = platform();
  
  switch (os) {
    case 'linux':
      return captureLinux(duration, sampleRate);
    case 'darwin':
      return captureMac(duration, sampleRate);
    case 'win32':
      return captureWindows(duration, sampleRate);
    default:
      throw new Error(`mic: unsupported platform: ${os}`);
  }
}

/**
 * Linux capture using arecord (ALSA)
 */
function captureLinux(duration, sampleRate) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    const proc = spawn('arecord', [
      '-f', 'S16_LE',
      '-r', String(sampleRate),
      '-c', String(DEFAULT_CHANNELS),
      '-t', 'wav',
      '-d', String(duration),
      '-q',
      '-'
    ]);

    proc.stdout.on('data', chunk => chunks.push(chunk));
    
    proc.stderr.on('data', data => {
      // arecord writes progress to stderr, ignore unless error
      const msg = data.toString();
      if (msg.includes('error') || msg.includes('Error')) {
        reject(new Error(`mic: arecord error: ${msg}`));
      }
    });

    proc.on('error', err => {
      if (err.code === 'ENOENT') {
        reject(new Error('mic: arecord not found. Install alsa-utils.'));
      } else {
        reject(new Error(`mic: arecord failed: ${err.message}`));
      }
    });

    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(`mic: arecord exited with code ${code}`));
        return;
      }
      const audioBuffer = Buffer.concat(chunks);
      if (audioBuffer.length < 100) {
        reject(new Error('mic: no audio captured'));
        return;
      }
      resolve({ audioBuffer, sampleRate });
    });
  });
}

/**
 * macOS capture using sox
 */
function captureMac(duration, sampleRate) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    const proc = spawn('sox', [
      '-d',  // default audio device
      '-t', 'wav',
      '-r', String(sampleRate),
      '-c', String(DEFAULT_CHANNELS),
      '-b', '16',
      '-',   // output to stdout
      'trim', '0', String(duration)
    ]);

    proc.stdout.on('data', chunk => chunks.push(chunk));

    proc.stderr.on('data', () => {
      // sox writes info to stderr, usually safe to ignore
    });

    proc.on('error', err => {
      if (err.code === 'ENOENT') {
        reject(new Error('mic: sox not found. Install with: brew install sox'));
      } else {
        reject(new Error(`mic: sox failed: ${err.message}`));
      }
    });

    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(`mic: sox exited with code ${code}`));
        return;
      }
      const audioBuffer = Buffer.concat(chunks);
      if (audioBuffer.length < 100) {
        reject(new Error('mic: no audio captured'));
        return;
      }
      resolve({ audioBuffer, sampleRate });
    });
  });
}

/**
 * Windows capture using ffmpeg with DirectShow
 */
function captureWindows(duration, sampleRate) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    // Use ffmpeg with DirectShow
    const proc = spawn('ffmpeg', [
      '-f', 'dshow',
      '-i', 'audio=Microphone',
      '-t', String(duration),
      '-ar', String(sampleRate),
      '-ac', String(DEFAULT_CHANNELS),
      '-f', 'wav',
      '-'
    ], { shell: true });

    proc.stdout.on('data', chunk => chunks.push(chunk));

    proc.stderr.on('data', () => {
      // ffmpeg writes status to stderr
    });

    proc.on('error', err => {
      if (err.code === 'ENOENT') {
        reject(new Error('mic: ffmpeg not found. Install ffmpeg and ensure it is in PATH.'));
      } else {
        reject(new Error(`mic: ffmpeg failed: ${err.message}`));
      }
    });

    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(`mic: ffmpeg exited with code ${code}`));
        return;
      }
      const audioBuffer = Buffer.concat(chunks);
      if (audioBuffer.length < 100) {
        reject(new Error('mic: no audio captured'));
        return;
      }
      resolve({ audioBuffer, sampleRate });
    });
  });
}

export default { captureOnce, capability };
