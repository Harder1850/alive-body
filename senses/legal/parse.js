/**
 * senses/legal/parse.js
 *
 * Convert HTML or PDF to plain text.
 * Preserve ordering. No interpretation.
 */

function decodeUtf8(bytes) {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function stripHtmlToText(html) {
  // Minimal, non-semantic HTML -> text conversion.
  // This is formatting-only; it does not summarize or interpret.
  return (
    html
      // remove scripts/styles
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // add newlines for block-ish elements
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\s*\/(p|div|h\d|li|tr)\s*>/gi, "\n")
      // drop remaining tags
      .replace(/<[^>]+>/g, " ")
      // decode a few common entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      // normalize whitespace (formatting only)
      .replace(/[ \t\f\v]+/g, " ")
      .replace(/\n\s+\n/g, "\n\n")
      .trim()
  );
}

function guessPdfText(bytes) {
  // Dependency-free fallback: attempt to extract text operands from raw PDF streams.
  // Not perfect; still strictly read-only and non-interpretive.
  const raw = bytes.toString("latin1");
  const matches = raw.match(/\(([^\)\\]*(?:\\.[^\)\\]*)*)\)\s*Tj/g) || [];
  const texts = matches
    .map((m) => {
      const inner = m.match(/\((.*)\)\s*Tj/);
      if (!inner) return "";
      return inner[1]
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\");
    })
    .filter(Boolean);
  return texts.join("\n").trim();
}

export function parseFetchedDocument({ bytes, contentType }) {
  const ct = (contentType || "").toLowerCase();

  // PDF
  if (ct.includes("application/pdf") || bytes.slice(0, 4).toString() === "%PDF") {
    const text = guessPdfText(bytes);
    return {
      ok: true,
      value: {
        content: text,
        contentFormat: "pdf-text",
      },
    };
  }

  // HTML/text
  const asText = decodeUtf8(bytes);
  const text = stripHtmlToText(asText);
  return {
    ok: true,
    value: {
      content: text,
      contentFormat: "html-text",
    },
  };
}

