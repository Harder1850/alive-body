import { ConfirmationMode } from './confirmationTypes';

export type ConfirmationRequest = {
  requestId: string;

  requestedAt: number;

  requestedBy:
    | { kind: 'SYSTEM'; systemId: string }
    | { kind: 'SERVICE'; serviceId: string };

  targetAction: string;

  summary: string;

  mode: ConfirmationMode;

  /** Human-readable explanation of consequences */
  consequences: string;

  /** Hard expiry for confirmation */
  expiresAt: number;

  /** Scope bound to this request */
  scope?: {
    actionTypes: string[];
    environments?: string[];
  };
};