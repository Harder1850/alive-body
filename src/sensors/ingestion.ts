import type { Signal } from '../../../alive-constitution/contracts/signal';

export function ingestInput(input: string): Signal {
  return {
    id: crypto.randomUUID(),
    source: 'system_api',
    raw_content: input,
    timestamp: Date.now(),
    threat_flag: false,
    firewall_status: 'pending',
  };
}
