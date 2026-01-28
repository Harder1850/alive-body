import { AIRequest } from './aiRequest';
import { AIResponse } from './aiResponse';

export interface ExternalAIAdapter {
  /**
   * Performs an AI inference after execution approval.
   * No tool calls, no memory writes, no side effects.
   */
  infer(req: AIRequest): Promise<AIResponse>;
}