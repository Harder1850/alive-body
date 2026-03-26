import type { Action } from '../../../alive-constitution/contracts/action';
import { recordExecution } from '../logging/execution-log';
import { writeWebFile } from '../tools/file-manager';

export function executeAction(action: Action): string {
  let result: string;

  if (action.type === 'display_text') {
    result = action.payload;
  } else if (action.type === 'write_file') {
    const { success, path, error } = writeWebFile(action.filename, action.content);
    result = success
      ? `FILE_WRITTEN: ${path}`
      : `FILE_WRITE_FAILED: ${error}`;
  } else {
    result = 'Unsupported action';
  }

  recordExecution({
    timestamp: Date.now(),
    signalId: '',
    decisionId: '',
    actionType: action.type,
    result,
  });

  return result;
}
