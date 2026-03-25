import type { Signal } from '../../../alive-constitution/contracts/signal';

export function firewallCheck(signal: Signal): Signal {
  // Minimal pass-through for Slice 1
  return {
    ...signal,
    firewall_status: 'cleared',
  };
}