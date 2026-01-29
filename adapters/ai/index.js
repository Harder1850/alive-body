/**
 * AI Adapter - Public API
 */

export * from './aiTypes.js';
export { initAIAdapter, aiRequest, ask, chat } from './aiAdapter.js';
export { anthropicRequest } from './providers/anthropic.js';
export { openaiRequest } from './providers/openai.js';

import adapter from './aiAdapter.js';
export default adapter;