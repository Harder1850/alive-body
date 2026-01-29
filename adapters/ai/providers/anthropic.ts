/**
 * Anthropic Claude Provider
 * 
 * Transport only. No cognition.
 */

import { AIRequest, AIResponse, AIMessage, AIProviderConfig } from '../aiTypes.js';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const API_URL = 'https://api.anthropic.com/v1/messages';

export async function anthropicRequest(
  request: AIRequest,
  config: AIProviderConfig
): Promise<AIResponse> {
  const model = request.model || config.defaultModel || DEFAULT_MODEL;
  
  // Build messages array
  const messages: { role: string; content: string }[] = [];
  
  // Add conversation history if provided
  if (request.messages) {
    for (const msg of request.messages) {
      if (msg.role !== 'system') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }
  
  // Add current prompt
  messages.push({ role: 'user', content: request.prompt });

  const body: Record<string, any> = {
    model,
    max_tokens: request.maxTokens || 4096,
    messages
  };

  // Add system prompt if provided
  if (request.system) {
    body.system = request.system;
  }

  // Add temperature if specified
  if (request.temperature !== undefined) {
    body.temperature = request.temperature;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        content: '',
        provider: 'anthropic',
        model,
        error: data.error?.message || `HTTP ${response.status}`,
        raw: data
      };
    }

    // Extract text from response
    const content = data.content
      ?.filter((block: any) => block.type === 'text')
      ?.map((block: any) => block.text)
      ?.join('') || '';

    return {
      success: true,
      content,
      provider: 'anthropic',
      model: data.model || model,
      usage: data.usage ? {
        input: data.usage.input_tokens,
        output: data.usage.output_tokens,
        total: data.usage.input_tokens + data.usage.output_tokens
      } : undefined,
      raw: data
    };
  } catch (err) {
    return {
      success: false,
      content: '',
      provider: 'anthropic',
      model,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}
