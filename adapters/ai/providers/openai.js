/**
 * OpenAI Provider
 * 
 * Transport only. No cognition.
 */

const DEFAULT_MODEL = 'gpt-4o';
const API_URL = 'https://api.openai.com/v1/chat/completions';

export async function openaiRequest(request, config) {
  const model = request.model || config.defaultModel || DEFAULT_MODEL;

  const messages = [];

  if (request.system) {
    messages.push({ role: 'system', content: request.system });
  }

  if (request.messages) {
    for (const msg of request.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: request.prompt });

  const body = {
    model,
    max_tokens: request.maxTokens || 4096,
    messages
  };

  if (request.temperature !== undefined) {
    body.temperature = request.temperature;
  }

  try {
    const response = await fetch(config.baseUrl || API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        content: '',
        provider: 'openai',
        model,
        error: data?.error?.message || `HTTP ${response.status}`,
        raw: data
      };
    }

    const content = data.choices?.[0]?.message?.content || '';

    return {
      success: true,
      content,
      provider: 'openai',
      model: data.model || model,
      usage: data.usage ? {
        input: data.usage.prompt_tokens,
        output: data.usage.completion_tokens,
        total: data.usage.total_tokens
      } : undefined,
      raw: data
    };
  } catch (err) {
    return {
      success: false,
      content: '',
      provider: 'openai',
      model,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}