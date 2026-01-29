# AI Adapter

Multi-provider LLM adapter for alive-body.

**Transport only. No cognition.**

---

## Supported Providers

| Provider | Models | Env Variable |
|----------|--------|--------------|
| Anthropic | claude-sonnet-4-20250514, claude-3-5-haiku-* | `ANTHROPIC_API_KEY` |
| OpenAI | gpt-4o, gpt-4-turbo, gpt-3.5-turbo | `OPENAI_API_KEY` |

---

## Setup

Set environment variables:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
```

---

## Usage

### Simple prompt

```typescript
import { ask } from './adapters/ai/index.js';

const response = await ask('What is 2+2?');
console.log(response.content);
```

### With provider selection

```typescript
import { ask } from './adapters/ai/index.js';

// Use Claude
const claude = await ask('Explain quantum computing', {
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514'
});

// Use GPT-4
const gpt = await ask('Explain quantum computing', {
  provider: 'openai',
  model: 'gpt-4o'
});
```

### Conversation

```typescript
import { chat } from './adapters/ai/index.js';

const history = [
  { role: 'user', content: 'My name is Alice' },
  { role: 'assistant', content: 'Hello Alice!' }
];

const response = await chat(history, 'What is my name?');
// response.content: "Your name is Alice"
```

### Full control

```typescript
import { aiRequest } from './adapters/ai/index.js';

const response = await aiRequest({
  provider: 'anthropic',
  prompt: 'Analyze this data',
  system: 'You are a data analyst',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 2000,
  temperature: 0.7
});

if (response.success) {
  console.log(response.content);
  console.log('Tokens used:', response.usage?.total);
} else {
  console.error('Error:', response.error);
}
```

---

## Architecture

```
Body
 └─ adapters/ai/
    ├─ aiAdapter.ts      # Main adapter (provider selection)
    ├─ aiTypes.ts        # Canonical types
    ├─ index.ts          # Public exports
    └─ providers/
       ├─ anthropic.ts   # Claude API
       └─ openai.ts      # OpenAI API
```

---

## Response Format

All providers return the same structure:

```typescript
{
  success: boolean;
  content: string;        // Generated text
  provider: 'anthropic' | 'openai';
  model: string;
  usage?: {
    input: number;
    output: number;
    total: number;
  };
  error?: string;         // If success=false
}
```

---

## Prohibitions

This adapter:
- ❌ Does NOT parse intent
- ❌ Does NOT engineer prompts
- ❌ Does NOT interpret responses
- ❌ Does NOT cache or remember

Core owns cognition. This is just transport.
