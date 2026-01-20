/**
 * senses/legal/readonly.js
 *
 * Orchestrates legal read-only collection.
 * Emits exactly one observation object (success OR error).
 * No loops. No retries. No interpretation.
 */

import { fetchUrlOnce } from "./fetch.js";
import { parseFetchedDocument } from "./parse.js";
import { validateLegalObservationOutput, validateLegalQueryInput } from "./validate.js";

function inferSourceType(url, requestedDocuments = []) {
  const lower = String(url).toLowerCase();
  if (requestedDocuments.includes("case_opinion")) return "case_opinion";
  if (requestedDocuments.includes("statute")) return "statute";
  if (lower.includes("supreme") || lower.includes("cases")) return "case_opinion";
  return "statute";
}

function makeErrorObservation({ stage, url, message }) {
  const obs = {
    type: "sense.legal.readonly.error",
    timestamp: new Date().toISOString(),
    error: {
      stage,
      url,
      message,
    },
  };

  const v = validateLegalObservationOutput(obs);
  if (!v.ok) {
    // If even the error shape fails, fall back to minimal safe object.
    return {
      type: "sense.legal.readonly.error",
      timestamp: new Date().toISOString(),
      error: { stage: "validate", message: v.error?.message || "Invalid error observation" },
    };
  }

  return obs;
}

export async function runLegalReadonlySensor(input) {
  const inputValidation = validateLegalQueryInput(input);
  if (!inputValidation.ok) {
    return makeErrorObservation({
      stage: inputValidation.error.stage,
      url: inputValidation.error.url,
      message: inputValidation.error.message,
    });
  }

  // HARD CONSTRAINT: explicitly provided URLs only.
  // Emit exactly one observation per run, so we read only the first URL.
  const url = input.sources[0];
  const sourceType = inferSourceType(url, input.requested_documents || []);

  const fetched = await fetchUrlOnce(url);
  if (!fetched.ok) {
    return makeErrorObservation(fetched.error);
  }

  const parsed = parseFetchedDocument({
    bytes: fetched.value.bytes,
    contentType: fetched.value.contentType,
  });

  if (!parsed.ok) {
    return makeErrorObservation({ stage: "parse", url, message: parsed.error?.message || "Parse failed" });
  }

  const obs = {
    type: "sense.legal.readonly",
    timestamp: new Date().toISOString(),
    jurisdiction: input.jurisdiction,
    documents: [
      {
        source_type: sourceType,
        title: "",
        court: "",
        case_name: "",
        citation: "",
        url,
        retrieved_at: fetched.value.retrievedAt,
        content: parsed.value.content,
        content_format: parsed.value.contentFormat,
      },
    ],
  };

  const outValidation = validateLegalObservationOutput(obs);
  if (!outValidation.ok) {
    return makeErrorObservation({ stage: "validate", url, message: outValidation.error.message });
  }

  return obs;
}

