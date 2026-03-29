## ALIVE Cleanup — Cline Instructions

Full audit summary and cleanup targets (single pass):

1. **Delete** `alive-constitution/src/main.ts` — constitutional violation (constitution importing from body/runtime/mind).
2. **Fix import depth** in `alive-mind/src/memory/rule-store.ts` and `alive-runtime/src/comparison-baseline/cb.ts` so contract imports resolve from sibling repos.
3. **Replace removed execution-log API usages** (`recordExecution`, `getLog`) with JSONL helpers:
   - `logActionDispatched`
   - `logActionOutcome`
   - `logCycleComplete`
4. **Fix Signal construction** in legacy adapters/runtime/mind/tests by using `makeSignal()` or by supplying required fields:
   - `kind`
   - `urgency`
   - `novelty`
   - `confidence`
   - `quality_score`
5. **Delete empty decision stubs**:
   - `alive-mind/src/decisions/contradiction-engine.ts`
   - `alive-mind/src/decisions/cost-risk-uncertainty.ts`
   - `alive-mind/src/decisions/decision-selector.ts`
   - `alive-mind/src/decisions/value-model.ts`
6. **Audit-flag** `alive-mind/src/decisions/reasoning-engine.ts` (parallel engine; review against `synthesize.ts` before Slice 5).
7. **Label** `alive-mind/src/decisions/llm-teacher.ts` as Slice 5 Level 5 target (do not wire during cleanup).
8. **Rename banned terminology**:
   - `alive-mind/src/memory/uc/unconscious-processor.ts` → `background-processor.ts`
   - `alive-mind/src/spine/conscious-buffer.ts` → `attention-buffer.ts`

Target outcome: clean compile (`tsc`) with **0 errors** before Slice 5 starts.