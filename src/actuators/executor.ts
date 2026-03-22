import type { Action } from '../../../alive-constitution/contracts/action';

export function executeAction(action: Action): string {
  if (action.type === 'display_text') {
    return action.payload;
  }

  return 'Unsupported action';
}
