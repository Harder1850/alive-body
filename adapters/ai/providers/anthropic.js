/**
 * Anthropic Claude Provider
 * 
 * Transport only. No cognition.
 */

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const API_URL = 'https://api.anthropic.com/v1/messages';

export async function anthropicRequest(request, config) {
  const model = request.model || config.defaultModel || DEFAULT_MODEL;

  const messages = [];

  if (request.messages) {
    for (const msg of request.messages) {
      if (msg.role !== 'system') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }

  messages.push({ role: 'user', content: request.prompt });

  const body = {
    model,
    max_tokens: request.maxTokens || 4096,
    messages
  };

  if (request.system) {
    body.system = request.system;
  }

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
        error: data?.error?.message || `HTTP ${response.status}`,
        raw: data
      };
    }

    const content = data.content
      ?.filter((block) => block.type === 'text')
      ?.map((block) => block.text)
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