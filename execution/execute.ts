import { ExecutionDecision } from "./decision";

export async function executeIfAllowed(
  decision: ExecutionDecision,
  adapter: () => Promise<unknown>
): Promise<unknown | null> {
  if (decision.kind !== "APPROVE") {
    return null;
  }

  return adapter();
}