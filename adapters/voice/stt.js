/**
 * ALIVE Speech-to-Text Adapter (Local Whisper)
 * 
 * Pure IO - accepts audio, returns text.
 * No intent guessing. No retries. No fallback logic.
 * 
 * Body may ACT but not DECIDE.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, access } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';

const execFileAsync = promisify(execFile);

// Capability registration
export const capability = {
  id: 'voice.stt',
  name: 'Speech-to-Text (Local Whisper)',
  description: 'Transcribes audio to text using local Whisper installation',
  requires: ['whisper'],
  offline: true
};

/**
 * Transcribe audio to text using local Whisper
 * @param {Object} input - Audio input
 * @param {Buffer} [input.audioBuffer] - Raw audio buffer (WAV format)
 * @param {string} [input.filePath] - Path to audio file
 * @param {string} [input.model] - Whisper model (tiny, base, small, medium, large)
 * @returns {Promise<{text: string, confidence?: number, language?: string}>}
 */
export async function transcribeOnce(input) {
  if (!input) {
    throw new Error('stt: input required');
  }

  const { audioBuffer, filePath, model = 'base' } = input;

  if (!audioBuffer && !filePath) {
    throw new Error('stt: audioBuffer or filePath required');
  }

  let tempFile = null;
  let audioPath = filePath;

  try {
    // If buffer provided, write to temp file
    if (audioBuffer) {
      const tempName = `alive_stt_${randomBytes(8).toString('hex')}.wav`;
      tempFile = join(tmpdir(), tempName);
      await writeFile(tempFile, audioBuffer);
      audioPath = tempFile;
    }

    // Verify audio file exists
    await access(audioPath);

    // Run whisper
    const result = await runWhisper(audioPath, model);

    return result;

  } finally {
    // Clean up temp file if created
    if (tempFile) {
      await unlink(tempFile).catch(() => {});
    }
  }
}

/**
 * Execute whisper CLI
 */
async function runWhisper(audioPath, model) {
  // Try whisper.cpp first (faster), fall back to openai-whisper
  const whisperCommands = [
    { cmd: 'whisper-cpp', args: buildWhisperCppArgs },
    { cmd: 'whisper', args: buildWhisperArgs },
    { cmd: 'main', args: buildWhisperCppArgs } // whisper.cpp binary name on some systems
  ];

  let lastError = null;

  for (const { cmd, args } of whisperCommands) {
    try {
      const cmdArgs = args(audioPath, model);
      const { stdout, stderr } = await execFileAsync(cmd, cmdArgs, {
        timeout: 120000, // 2 minute max
        maxBuffer: 10 * 1024 * 1024
      });

      return parseWhisperOutput(stdout, stderr, cmd);

    } catch (err) {
      lastError = err;
      if (err.code !== 'ENOENT') {
        // Not a "command not found" error - rethrow
        throw new Error(`stt: whisper failed: ${err.message}`);
      }
    }
  }

  throw new Error(`stt: no whisper installation found. Install whisper.cpp or openai-whisper. Last error: ${lastError?.message}`);
}

function buildWhisperCppArgs(audioPath, model) {
  return [
    '-m', getWhisperCppModelPath(model),
    '-f', audioPath,
    '--no-timestamps',
    '-otxt'
  ];
}

function buildWhisperArgs(audioPath, model) {
  return [
    audioPath,
    '--model', model,
    '--output_format', 'txt',
    '--output_dir', tmpdir()
  ];
}

function getWhisperCppModelPath(model) {
  // Standard whisper.cpp model paths
  const modelMap = {
    'tiny': 'ggml-tiny.bin',
    'base': 'ggml-base.bin',
    'small': 'ggml-small.bin',
    'medium': 'ggml-medium.bin',
    'large': 'ggml-large.bin'
  };
  const modelFile = modelMap[model] || `ggml-${model}.bin`;
  
  // Check common locations
  const locations = [
    join(process.env.HOME || '', '.whisper', modelFile),
    join('/usr/local/share/whisper', modelFile),
    join('/usr/share/whisper', modelFile),
    modelFile
  ];

  return locations[0]; // Let whisper.cpp fail if not found
}

function parseWhisperOutput(stdout, stderr, cmd) {
  let text = stdout.trim();
  let language = null;
  let confidence = null;

  // Extract language if detected
  const langMatch = stderr?.match(/Detected language: (\w+)/i) || 
                    stdout?.match(/Detected language: (\w+)/i);
  if (langMatch) {
    language = langMatch[1].toLowerCase();
  }

  // Clean up whisper.cpp output artifacts
  text = text
    .replace(/\[.*?\]/g, '') // Remove timestamps
    .replace(/^\s*\n/gm, '') // Remove empty lines
    .trim();

  if (!text) {
    throw new Error('stt: no speech detected in audio');
  }

  return { text, confidence, language };
}

export default { transcribeOnce, capability };
