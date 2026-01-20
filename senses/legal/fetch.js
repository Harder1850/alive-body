/**
 * senses/legal/fetch.js
 *
 * Deterministic HTTP GET only.
 * No retries. No cookies. No auth. No crawling.
 */

export async function fetchUrlOnce(url) {
  const retrievedAt = new Date().toISOString();

  let res;
  try {
    res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent": "alive-body-legal-sensor/0",
        accept: "text/html,application/pdf;q=0.9,*/*;q=0.8",
      },
    });
  } catch (err) {
    return {
      ok: false,
      error: { stage: "fetch", url, message: err?.message || String(err) },
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: { stage: "fetch", url, message: `${res.status} ${res.statusText}` },
    };
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  let arrayBuffer;
  try {
    arrayBuffer = await res.arrayBuffer();
  } catch (err) {
    return {
      ok: false,
      error: { stage: "fetch", url, message: err?.message || String(err) },
    };
  }

  return {
    ok: true,
    value: {
      url,
      retrievedAt,
      contentType,
      bytes: Buffer.from(arrayBuffer),
    },
  };
}

