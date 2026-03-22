import type { Signal } from '../../../alive-constitution/contracts/signal';

export function ingestInput(input: string): Signal {
  // PATCH 1: Initialize all required signal fields
  const id = crypto.randomUUID();
  return {
    id,
    signal_id: id,  // Copy from id for consistency
    source: 'interface',
    origin: 'external',  // Mark as external input source
    raw_content: input,
    timestamp: Date.now(),
    firewall_status: 'pending',
    quality_score: 1,
    stg_verified: false,  // Default: unverified until STG gate
    binding_complete: false,  // Default: binding not yet complete
  };
}
