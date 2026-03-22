/**
 * Emergency Stop — halts all actuators immediately.
 * Can fire without Runtime instruction per safe-state rules.
 */
export class EmergencyStop {
  private active = false;

  trigger(reason: string): void {
    this.active = true;
    console.error(`[EMERGENCY STOP] ${reason}`);
    // TODO: halt all actuators
  }

  isActive(): boolean {
    return this.active;
  }

  reset(): void {
    // Only callable via recovery sequence
    this.active = false;
  }
}
