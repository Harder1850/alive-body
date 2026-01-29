/**
 * AI Adapter Types
 * 
 * Canonical types for LLM interaction.
 * Body owns adapters. Core owns cognition.
 */

export type AIProvider = 'anthropic' | 'openai';

export interface AIRequest {
  /** Which provider to use */
  provider: AIProvider;
  
  /** The prompt/message to send */
  prompt: string;
  
  /** System prompt (optional) */
  system?: string;
  
  /** Conversation history (optional) */
  messages?: AIMessage[];
  
  /** Model override (uses default if not specified) */
  model?: string;
  
  /** Max tokens to generate */
  maxTokens?: number;
  
  /** Temperature (0-1) */
  temperature?: number;
  
  /** Request metadata */
  meta?: Record<string, any>;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  /** Whether the request succeeded */
  success: boolean;
  
  /** The generated text */
  content: string;
  
  /** Which provider was used */
  provider: AIProvider;
  
  /** Which model was used */
  model: string;
  
  /** Token usage */
  usage?: {
    input: number;
    output: number;
    total: number;
  };
  
  /** Error message if failed */
  error?: string;
  
  /** Raw provider response (for debugging) */
  raw?: any;
}

export interface AIProviderConfig {
  apiKey: string;
  defaultModel: string;
  baseUrl?: string;
}

export interface AIAdapterConfig {
  anthropic?: AIProviderConfig;
  openai?: AIProviderConfig;
  defaultProvider: AIProvider;
}
