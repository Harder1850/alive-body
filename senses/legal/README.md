# Legal Research Sensor (Read-Only) — Constitutional README

## Status

MANDATORY — READ-ONLY — OBSERVATION-ONLY

## Purpose

This sensor exists solely to **collect primary legal materials** from **explicit, host-provided URLs** (e.g., statutes and case opinions) and emit **raw, attributable text** as a single observation event.

## Non-Negotiable Constraints

This sensor:

- is **read-only**
- provides **no legal advice**
- performs **no interpretation**
- performs **no summarization**
- performs **no ranking / relevance scoring**
- performs **no discovery** (no search, no crawling, no expansion beyond explicit URLs)
- has **zero authority**
- cannot escalate privileges

It reads. It does not think.

## Output

Emits exactly **one** observation per run:

- `sense.legal.readonly` on success, containing verbatim text with attribution
- `sense.legal.readonly.error` on failure, containing stage + url + message

Execution is finite: one run → return control to the Body → exit cleanly.

