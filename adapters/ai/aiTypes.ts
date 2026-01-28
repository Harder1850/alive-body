export type AICapability =
  | 'TEXT_COMPLETION'
  | 'CHAT_COMPLETION'
  | 'EMBEDDING'
  | 'CLASSIFICATION'
  | 'SUMMARIZATION';

export type AIModelDescriptor = {
  provider: 'OPENAI' | 'LOCAL' | 'CUSTOM';
  modelId: string;
  version?: string;
  locality: 'REMOTE' | 'LOCAL';
};