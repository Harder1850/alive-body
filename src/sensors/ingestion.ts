import type { Signal } from '../../../alive-constitution/contracts';

export function ingestInput(input: string): Signal {
  return {
    id:            crypto.randomUUID(),
    source:        'system_api',
    kind:          'user_input',
    raw_content:   input,
    timestamp:     Date.now(),
    urgency:       0.5,
    novelty:       0.0,
    confidence:    1.0,
    quality_score: 1.0,
    threat_flag:   false,
    firewall_status: 'pending',
    perceived_at:  Date.now(),
  };
}
