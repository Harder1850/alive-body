import type { Signal } from '../../../alive-constitution/contracts';

/** Filters noise and invalid data from sensor stream. */
export class Filtering {
  filter(_signal: Signal): boolean {
    // TODO: implement — return true if signal passes
    return true;
  }
}
