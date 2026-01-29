/**
 * SYSTEM CONNECTOR (Body ↔ alive-system)
 *
 * Responsibilities:
 * - Transport observations from alive-system into Body
 * - Transport render instructions back to alive-system
 *
 * Prohibitions:
 * - No intent parsing
 * - No policy decisions
 * - No direct Core calls
 * - No UI awareness
 *
 * This is the spinal cord. System is the spine.
 */

import WebSocket from 'ws';

const BASE_URL = process.env.ALIVE_SYSTEM_URL || 'ws://localhost:7070';
const SYSTEM_URL = `${BASE_URL}/?type=body`;

console.log('[system-connector] URL:', SYSTEM_URL);


let socket = null;
let connected = false;
let observationHandler = null;

/**
 * Start the system connector.
 * This connects Body to alive-system.
 */
export function startSystemConnector() {
  console.log('[system-connector] Connecting to alive-system...');
  
  socket = new WebSocket(SYSTEM_URL);
  
  socket.on('open', () => {
    connected = true;
    console.log('[system-connector] Connected to alive-system');
  });
  
  socket.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log('[system-connector] Received:', msg.type);
      
      if (msg.type === 'observation') {
        await handleObservation(msg);
      }
    } catch (err) {
      console.error('[system-connector] Error processing message:', err);
    }
  });
  
  socket.on('close', () => {
    connected = false;
    console.log('[system-connector] Disconnected from alive-system');
    
    // Auto-reconnect after 3 seconds
    setTimeout(() => {
      console.log('[system-connector] Attempting reconnect...');
      startSystemConnector();
    }, 3000);
  });
  
  socket.on('error', (err) => {
    console.error('[system-connector] WebSocket error:', err.message);
  });
}

/**
 * Handle an incoming observation.
 */
async function handleObservation(observation) {
  console.log(`[system-connector] Observation (${observation.modality}):`, 
    typeof observation.raw === 'string' ? observation.raw.slice(0, 100) : '[data]');
  
  if (observationHandler) {
    try {
      const render = await observationHandler(observation);
      if (render) {
        sendRender(render);
      }
    } catch (err) {
      console.error('[system-connector] Handler error:', err);
      sendRender({
        type: 'render',
        canvas: 'text',
        content: { text: `Error: ${err.message}` }
      });
    }
  } else {
    // Default: echo back
    sendRender({
      type: 'render',
      canvas: 'text',
      content: { text: `Body received: ${observation.raw}` }
    });
  }
}

/**
 * Send a render instruction to alive-system.
 */
export function sendRender(render) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('[system-connector] Cannot send render - not connected');
    return false;
  }
  
  // Ensure proper format
  const msg = {
    type: 'render',
    canvas: render.canvas || 'text',
    content: render.content || render
  };
  
  console.log('[system-connector] Sending render:', msg.canvas);
  socket.send(JSON.stringify(msg));
  return true;
}

/**
 * Set the observation handler.
 * This is how Body processes observations.
 */
export function setObservationHandler(handler) {
  observationHandler = handler;
}

/**
 * Check if connected.
 */
export function isConnected() {
  return connected && socket && socket.readyState === WebSocket.OPEN;
}

export default {
  start: startSystemConnector,
  sendRender,
  setObservationHandler,
  isConnected
};
