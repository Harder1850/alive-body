export type AuthorityHolder =
  | { kind: "HUMAN"; humanId: string }
  | { kind: "SYSTEM"; systemId: string }
  | { kind: "SERVICE"; serviceId: string };

export type AuthorityScope = {
  actionTypes: string[];
  environments: ("DEV" | "PROD" | "SANDBOX")[];
  targets?: string[];
};

export type AuthorityClaim = {
  claimedGrantId: string;
  claimedBy: AuthorityHolder;
};