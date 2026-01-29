import { ExecutionPolicy } from "./policy";
import { AuthorityModel } from "./authority";

export interface ArbiterContext {
  policy: ExecutionPolicy;
  authority: AuthorityModel;
  now: number;
}