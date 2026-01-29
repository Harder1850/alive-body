/**
 * AI ADAPTER (Body → LLM)
 *
 * Responsibilities:
 * - Transport requests to LLM providers
 * - Return responses in canonical format
 * - Handle provider selection
 *
 * Prohibitions:
 * - No intent parsing
 * - No prompt engineering
 * - No response interpretation
 * - No caching or memory
 *
 * Body owns adapters. Core owns cognition.
 */

import { anthropicRequest } from './providers/anthropic.js';
import { openaiRequest } from './providers/openai.js';

let adapterConfig = null;

export function initAIAdapter(config = {}) {
  adapterConfig = {
    defaultProvider: config.defaultProvider || 'anthropic',
    anthropic: config.anthropic || {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      defaultModel: 'claude-sonnet-4-20250514'
    },
    openai: config.openai || {
      apiKey: process.env.OPENAI_API_KEY || '',
      defaultModel: 'gpt-4o'
    }
  };

  const hasAnthropic = !!adapterConfig.anthropic?.apiKey;
  const hasOpenai = !!adapterConfig.openai?.apiKey;

  if (!hasAnthropic && !hasOpenai) {
    console.warn('[ai-adapter] No API keys configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY');
  } else {
    const providers = [];
    if (hasAnthropic) providers.push('anthropic');
    if (hasOpenai) providers.push('openai');
    console.log(`[ai-adapter] Initialized with providers: ${providers.join(', ')}`);
  }
}

export async function aiRequest(request) {
  if (!adapterConfig) {
    initAIAdapter();
  }

  const provider = request.provider || adapterConfig.defaultProvider;

  switch (provider) {
    case 'anthropic': {
      const config = adapterConfig.anthropic;
      if (!config?.apiKey) {
        return {
          success: false,
          content: '',
          provider: 'anthropic',
          model: request.model || 'unknown',
          error: 'Anthropic API key not configured'
        };
      }
      return anthropicRequest(request, config);
    }

    case 'openai': {
      const config = adapterConfig.openai;
      if (!config?.apiKey) {
        return {
          success: false,
          content: '',
          provider: 'openai',
          model: request.model || 'unknown',
          error: 'OpenAI API key not configured'
        };
      }
      return openaiRequest(request, config);
    }

    default:
      return {
        success: false,
        content: '',
        provider,
        model: request.model || 'unknown',
        error: `Unknown provider: ${provider}`
      };
  }
}

export async function ask(prompt, options = {}) {
  return aiRequest({
    provider: options.provider || adapterConfig?.defaultProvider || 'anthropic',
    prompt,
    system: options.system,
    model: options.model,
    maxTokens: options.maxTokens,
    temperature: options.temperature
  });
}

export async function chat(messages, newMessage, options = {}) {
  return aiRequest({
    provider: options.provider || adapterConfig?.defaultProvider || 'anthropic',
    prompt: newMessage,
    messages,
    system: options.system,
    model: options.model,
    maxTokens: options.maxTokens
  });
}

export default {
  init: initAIAdapter,
  request: aiRequest,
  ask,
  chat
};