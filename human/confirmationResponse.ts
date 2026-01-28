import { ConfirmationMode } from './confirmationTypes';

export type ConfirmationResponse = {
  responseId: string;

  requestId: string;

  respondedAt: number;

  responder:
    | { kind: 'HUMAN'; humanId: string };

  decision: 'APPROVE' | 'DENY';

  mode: ConfirmationMode;

  /** Optional justification */
  notes?: string;
};