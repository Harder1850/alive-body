import { PolicyKind } from './policyTypes';

export type PolicyCheck = {
  policyId: string;

  kind: PolicyKind;

  description: string;

  /** Result of this check */
  outcome: 'PASS' | 'FAIL' | 'WARN' | 'UNKNOWN';

  /** Optional explanation */
  rationale?: string;

  /** Whether this check is mandatory */
  required: boolean;
};