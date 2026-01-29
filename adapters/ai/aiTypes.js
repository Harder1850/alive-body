/**
 * AI Adapter Types
 * 
 * Canonical types for LLM interaction.
 * Body owns adapters. Core owns cognition.
 */

/** @typedef {'anthropic' | 'openai'} AIProvider */

/**
 * @typedef {Object} AIMessage
 * @property {'user' | 'assistant' | 'system'} role
 * @property {string} content
 */

/**
 * @typedef {Object} AIRequest
 * @property {AIProvider} provider
 * @property {string} prompt
 * @property {string=} system
 * @property {AIMessage[]=} messages
 * @property {string=} model
 * @property {number=} maxTokens
 * @property {number=} temperature
 * @property {Record<string, any>=} meta
 */

/**
 * @typedef {Object} AIResponse
 * @property {boolean} success
 * @property {string} content
 * @property {AIProvider} provider
 * @property {string} model
 * @property {{ input: number, output: number, total: number }=} usage
 * @property {string=} error
 * @property {any=} raw
 */

/**
 * @typedef {Object} AIProviderConfig
 * @property {string} apiKey
 * @property {string} defaultModel
 * @property {string=} baseUrl
 */

/**
 * @typedef {Object} AIAdapterConfig
 * @property {AIProviderConfig=} anthropic
 * @property {AIProviderConfig=} openai
 * @property {AIProvider} defaultProvider
 */

export {};