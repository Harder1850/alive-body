/**
 * Senses entrypoint.
 * MUST only observe and return descriptive events (no interpretation).
 */
import { runLegalReadonlySensor } from "./legal/readonly.js";

export async function collectSenseEvents() {
  // Demo-safe, one-shot: collect at most one legal observation if provided by host.
  // Input is treated as explicit host instruction.
  const raw = process.env.ALIVE_LEGAL_QUERY_JSON;
  if (!raw) return [];

  let input;
  try {
    input = JSON.parse(raw);
  } catch (err) {
    return [
      {
        type: "sense.legal.readonly.error",
        timestamp: new Date().toISOString(),
        error: {
          stage: "validate",
          message: err?.message || "Invalid ALIVE_LEGAL_QUERY_JSON (must be JSON)",
        },
      },
    ];
  }

  const observation = await runLegalReadonlySensor(input);
  return [observation];
}
