/**
 * Render Utilities
 *
 * Helpers for creating render instructions.
 * Pure data construction - no logic.
 */

/**
 * Create a render message for alive-system.
 *
 * @param {string} canvas - 'text' | 'document' | 'dashboard' | 'viz' | 'blank'
 * @param {object} content - Canvas-specific content
 */
export function createRenderMessage(canvas, content) {
  return {
    type: "render",
    canvas,
    content,
  };
}

/**
 * Create a text render.
 */
export function textRender(text, status = "ok") {
  return createRenderMessage("text", { text, status });
}

/**
 * Create an error render.
 */
export function errorRender(message) {
  return createRenderMessage("text", { error: message, status: "error" });
}

/**
 * Create a document render.
 */
export function documentRender(html, title = "") {
  return createRenderMessage("document", { html, title });
}

/**
 * Create a blank render (clear canvas).
 */
export function blankRender() {
  return createRenderMessage("blank", {});
}

export default {
  createRenderMessage,
  textRender,
  errorRender,
  documentRender,
  blankRender,
};