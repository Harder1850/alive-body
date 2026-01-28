export type AIResponse = {
  requestId: string;

  respondedAt: number;

  output: unknown;

  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };

  /** Explicit uncertainty + trust boundary */
  trust: {
    level: 'UNTRUSTED';
    modelConfidence?: number;
  };

  metadata?: {
    latencyMs?: number;
    providerRequestId?: string;
  };
};