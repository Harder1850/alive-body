/** Incident recorder for safety events. */
export class IncidentLog {
  private incidents: unknown[] = [];

  record(_incident: unknown): void {
    this.incidents.push({ ..._incident as object, ts: Date.now() });
    console.warn("[INCIDENT]", _incident);
  }
}
