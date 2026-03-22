/** Tracks reversible actions for potential rollback. */
export class ReversibleActions {
  private log: unknown[] = [];

  record(_action: unknown): void {
    this.log.push(_action);
  }

  rollback(_actionId: string): void {
    // TODO: implement rollback
  }
}
