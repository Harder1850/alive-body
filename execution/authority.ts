import { ExecutionRequest } from "./request";

export type AuthorityCheckResult = {
  granted: boolean;
  reason?: string;
};

export interface AuthorityModel {
  check(request: ExecutionRequest): AuthorityCheckResult;
}