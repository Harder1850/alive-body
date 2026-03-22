export interface ExecutionLogEntry {
  timestamp: number;
  signalId: string;
  decisionId: string;
  actionType: string;
  result: string;
}

const log: ExecutionLogEntry[] = [];

export function recordExecution(entry: ExecutionLogEntry) {
  log.push(entry);
}

export function getExecutionLog() {
  return log;
}

export function getLog() {
  return log;
}
