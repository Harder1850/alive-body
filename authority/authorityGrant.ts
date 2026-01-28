import { AuthorityHolder, AuthorityScope } from "./authorityTypes";

export type AuthorityGrant = {
  grantId: string;
  grantedTo: AuthorityHolder;
  grantedBy: AuthorityHolder;
  scope: AuthorityScope;
  issuedAt: number;
  expiresAt?: number;
  revocable: boolean;
  constraints?: AuthorityConstraint[];
};

export type AuthorityConstraint =
  | { kind: "REQUIRES_CONFIRMATION" }
  | { kind: "MAX_RISK"; level: "LOW" | "MEDIUM" | "HIGH" }
  | { kind: "TIME_WINDOW"; start: number; end: number }
  | { kind: "ONE_TIME_USE" };