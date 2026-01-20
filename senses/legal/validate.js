/**
 * senses/legal/validate.js
 *
 * Validation for:
 * - input contract (host-provided legal.query)
 * - output contract (raw observation)
 *
 * No interpretation. Reject malformed input explicitly.
 */

export function validateLegalQueryInput(input) {
  if (!input || typeof input !== "object") {
    return { ok: false, error: { stage: "validate", message: "Input must be an object" } };
  }

  if (input.type !== "legal.query") {
    return {
      ok: false,
      error: { stage: "validate", message: "Input.type must be 'legal.query'" },
    };
  }

  if (!input.jurisdiction || typeof input.jurisdiction !== "string") {
    return {
      ok: false,
      error: { stage: "validate", message: "Input.jurisdiction must be a string" },
    };
  }

  if (!Array.isArray(input.sources) || input.sources.length === 0) {
    return {
      ok: false,
      error: { stage: "validate", message: "Input.sources must be a non-empty array" },
    };
  }

  for (const url of input.sources) {
    if (typeof url !== "string" || url.trim().length === 0) {
      return {
        ok: false,
        error: { stage: "validate", message: "Each source URL must be a non-empty string" },
      };
    }
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return {
        ok: false,
        error: { stage: "validate", url, message: "Invalid URL" },
      };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        ok: false,
        error: { stage: "validate", url, message: "URL protocol must be http or https" },
      };
    }
  }

  // requested_documents is optional; if present it must be an array of strings.
  if (
    input.requested_documents !== undefined &&
    (!Array.isArray(input.requested_documents) ||
      input.requested_documents.some((d) => typeof d !== "string"))
  ) {
    return {
      ok: false,
      error: { stage: "validate", message: "requested_documents must be an array of strings" },
    };
  }

  return { ok: true };
}

export function validateLegalObservationOutput(obs) {
  if (!obs || typeof obs !== "object") {
    return { ok: false, error: { stage: "validate", message: "Observation must be an object" } };
  }

  if (typeof obs.type !== "string") {
    return { ok: false, error: { stage: "validate", message: "Observation.type must be a string" } };
  }

  if (typeof obs.timestamp !== "string") {
    return { ok: false, error: { stage: "validate", message: "Observation.timestamp must be a string" } };
  }

  // Success shape
  if (obs.type === "sense.legal.readonly") {
    if (typeof obs.jurisdiction !== "string") {
      return { ok: false, error: { stage: "validate", message: "jurisdiction must be a string" } };
    }
    if (!Array.isArray(obs.documents)) {
      return { ok: false, error: { stage: "validate", message: "documents must be an array" } };
    }
    return { ok: true };
  }

  // Error shape
  if (obs.type === "sense.legal.readonly.error") {
    if (!obs.error || typeof obs.error !== "object") {
      return { ok: false, error: { stage: "validate", message: "error must be an object" } };
    }
    if (typeof obs.error.stage !== "string") {
      return { ok: false, error: { stage: "validate", message: "error.stage must be a string" } };
    }
    if (typeof obs.error.message !== "string") {
      return { ok: false, error: { stage: "validate", message: "error.message must be a string" } };
    }
    return { ok: true };
  }

  return { ok: false, error: { stage: "validate", message: "Unknown observation.type" } };
}

