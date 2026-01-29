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

import { AIRequest, AIResponse, AIAdapterConfig, AIProvider } from './aiTypes.js';
import { anthropicRequest } from './providers/anthropic.js';
import { openaiRequest } from './providers/openai.js';

let adapterConfig: AIAdapterConfig | null = null;

/**
 * Initialize the AI adapter with configuration.
 * Call this once at Body startup.
 */
export function initAIAdapter(config?: Partial<AIAdapterConfig>): void {
  adapterConfig = {
    defaultProvider: config?.defaultProvider || 'anthropic',
    anthropic: config?.anthropic || {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      defaultModel: 'claude-sonnet-4-20250514'
    },
    openai: config?.openai || {
      apiKey: process.env.OPENAI_API_KEY || '',
      defaultModel: 'gpt-4o'
    }
  };

  // Validate at least one provider is configured
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

/**
 * Send a request to an LLM provider.
 * 
 * @param request - The AI request
 * @returns AI response with content or error
 */
export async function aiRequest(request: AIRequest): Promise<AIResponse> {
  if (!adapterConfig) {
    initAIAdapter();
  }

  const provider = request.provider || adapterConfig!.defaultProvider;
  
  switch (provider) {
    case 'anthropic': {
      const config = adapterConfig!.anthropic;
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
      const config = adapterConfig!.openai;
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
        provider: provider as AIProvider,
        model: request.model || 'unknown',
        error: `Unknown provider: ${provider}`
      };
  }
}

/**
 * Convenience: Send a simple prompt to the default provider.
 */
export async function ask(
  prompt: string,
  options?: {
    provider?: AIProvider;
    system?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<AIResponse> {
  return aiRequest({
    provider: options?.provider || adapterConfig?.defaultProvider || 'anthropic',
    prompt,
    system: options?.system,
    model: options?.model,
    maxTokens: options?.maxTokens,
    temperature: options?.temperature
  });
}

/**
 * Convenience: Continue a conversation.
 */
export async function chat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  newMessage: string,
  options?: {
    provider?: AIProvider;
    system?: string;
    model?: string;
    maxTokens?: number;
  }
): Promise<AIResponse> {
  return aiRequest({
    provider: options?.provider || adapterConfig?.defaultProvider || 'anthropic',
    prompt: newMessage,
    messages,
    system: options?.system,
    model: options?.model,
    maxTokens: options?.maxTokens
  });
}

export default {
  init: initAIAdapter,
  request: aiRequest,
  ask,
  chat
};
