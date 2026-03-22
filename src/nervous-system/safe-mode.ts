/** Safe mode — reduced operation state. */
export class SafeMode {
  private enabled = false;

  enter(): void {
    this.enabled = true;
  }

  exit(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
