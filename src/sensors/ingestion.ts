import type { Signal } from '../../../alive-constitution/contracts/signal';

export function ingestInput(input: string): Signal {
  return {
    id: crypto.randomUUID(),
    source: 'interface',
    raw_content: input,
    timestamp: Date.now(),
    firewall_status: 'pending',
    quality_score: 1,
  };
}
