/**
 * Observation Handler - Claude Integration
 *
 * Routes observations through Claude for intelligent responses.
 */
import { ask } from '../adapters/ai/index.js';

function textRender(text) {
  return {
    type: 'render',
    canvas: 'text',
    content: { text }
  };
}

export async function initWithCore() {
  console.log('[handler] Initializing...');
  return true;
}

export async function handleObservation(observation) {
  const { modality, raw } = observation;
  
  if (modality !== 'text' && modality !== 'voice') {
    return textRender(`[Modality '${modality}' not yet supported]`);
  }

  try {
    console.log('[handler] Calling Claude with:', raw);
    
    const response = await ask(raw, {
      system: `You are ALIVE - an AI system with persistent identity, memory, and the ability to act.

Core principles:
- Body acts, Brain decides (clean separation)
- Append-only experience (never forget)  
- Bounded authority (know your limits)
- Transparent operation (explain reasoning)

Respond helpfully and honestly. Be concise but thoughtful.`
    });

    console.log('[handler] Claude response:', response);

    if (response.success) {
      return textRender(response.content);
    } else {
      return textRender(`Error: ${response.error}`);
    }
  } catch (err) {
    console.error('[handler] Error:', err);
    return textRender(`Error: ${err.message}`);
  }
}

export default handleObservation;
