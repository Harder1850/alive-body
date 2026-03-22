/** Logs all action executions. */
export class ExecutionLog {
  private entries: unknown[] = [];

  log(_action: unknown): void {
    this.entries.push({ ..._action as object, ts: Date.now() });
  }

  getAll(): unknown[] {
    return [...this.entries];
  }
}
