import { AuthorityGrant } from "./authorityGrant";

export type AuthorityChain = {
  rootAuthority: AuthorityGrant;
  delegations: AuthorityGrant[];
  terminalAuthority: AuthorityGrant;
};