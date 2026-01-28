export type InternetResponse = {
  requestId: string;

  respondedAt: number;

  status: number;

  headers: Record<string, string>;

  body: unknown;

  /** Adapter-level metadata */
  metadata?: {
    bytesReceived?: number;
    durationMs?: number;
    sourceIp?: string;
  };

  /** Trust boundary marker */
  trustLevel: 'UNTRUSTED';
};