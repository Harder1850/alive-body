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

import WebSocket from "ws";

const SYSTEM_WS_URL =
  process.env.ALIVE_SYSTEM_URL || "ws://localhost:7070/?type=body";

let socket = null;
let reconnectTimer = null;
const RECONNECT_INTERVAL = 5000;

/**
 * Handle incoming observation from alive-system.
 * Override this by calling setObservationHandler().
 */
let observationHandler = async (observation) => {
  // Default: echo back as text render
  console.log("[system-connector] observation received:", observation.modality);
  return {
    render: {
      canvas: "text",
      content: {
        text: `Body received: ${
          typeof observation.raw === "string" ? observation.raw : "[data]"
        }`,
        status: "processed",
      },
    },
  };
};

/**
 * Set custom observation handler.
 * Handler receives observation, returns { render: { canvas, content } } or null.
 */
export function setObservationHandler(handler) {
  observationHandler = handler;
}

/**
 * Send render instruction to alive-system.
 */
export function sendRender(canvas, content) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "render",
        canvas,
        content,
      })
    );
  } else {
    console.warn("[system-connector] Cannot send render - not connected");
  }
}

/**
 * Start the system connector.
 */
export function startSystemConnector() {
  if (socket?.readyState === WebSocket.OPEN) {
    console.log("[system-connector] Already connected");
    return;
  }

  console.log("[system-connector] Connecting to", SYSTEM_WS_URL);
  socket = new WebSocket(SYSTEM_WS_URL);

  socket.on("open", () => {
    console.log("[system-connector] Connected to alive-system");
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  socket.on("message", async (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (err) {
      console.error("[system-connector] Failed to parse message:", err);
      return;
    }

    // Only handle observations
    if (msg.type !== "observation") {
      console.log("[system-connector] Ignoring non-observation:", msg.type);
      return;
    }

    try {
      // Hand off to Body execution layer
      const result = await observationHandler(msg);

      // If execution produced a renderable result, send it back
      if (result?.render) {
        sendRender(result.render.canvas, result.render.content);
      }
    } catch (err) {
      console.error("[system-connector] Observation handler error:", err);
      // Send error render
      sendRender("text", {
        error: err.message,
        status: "error",
      });
    }
  });

  socket.on("close", () => {
    console.log("[system-connector] Disconnected from alive-system");
    scheduleReconnect();
  });

  socket.on("error", (err) => {
    console.error("[system-connector] WebSocket error:", err.message);
  });
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  console.log(
    `[system-connector] Reconnecting in ${RECONNECT_INTERVAL / 1000}s...`
  );
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startSystemConnector();
  }, RECONNECT_INTERVAL);
}

/**
 * Stop the system connector.
 */
export function stopSystemConnector() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
}

export default {
  start: startSystemConnector,
  stop: stopSystemConnector,
  sendRender,
  setObservationHandler,
};