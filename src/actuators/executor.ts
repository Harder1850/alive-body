import type { Action } from '../../../alive-constitution/contracts/action';
import { logActionDispatched, logActionOutcome } from '../logging/execution-log';
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

  const signalId = 'executor-local';
  const decisionId = `exec-${Date.now()}`;
  logActionDispatched(signalId, decisionId, action.type);
  logActionOutcome(signalId, decisionId, !result.startsWith('FILE_WRITE_FAILED'), result);

  return result;
}
