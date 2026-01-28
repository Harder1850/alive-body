export type ExecutionRequest = {
  requestId: string;
  action: ActionDescriptor;
  justification: Justification;
  authority: AuthorityClaim;
  context: ExecutionContext;
  requestedAt: number;
};

export type ActionDescriptor = {
  actionType: string;
  target: string;
  parameters?: unknown;
  estimatedReversibility?: "REVERSIBLE" | "IRREVERSIBLE" | "UNKNOWN";
};

export type Justification = {
  source: "CORE" | "HUMAN" | "SYSTEM";
  summary: string;
  evidence?: unknown;
  confidence?: number;
};

export type AuthorityClaim = {
  claimedBy: "HUMAN" | "SYSTEM" | "AUTOMATED";
  scope: string[];
  expiresAt?: number;
};

export type ExecutionContext = {
  environment: "DEV" | "PROD" | "SANDBOX";
  riskTolerance?: "LOW" | "MEDIUM" | "HIGH";
  dryRunPreferred?: boolean;
};