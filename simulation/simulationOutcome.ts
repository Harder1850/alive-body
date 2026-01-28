export type SimulationOutcome = {
  outcomeId: string;
  description: string;
  probability?: number;
  confidence?: number;
  sideEffects?: string[];
  irreversible?: boolean;
  notes?: string;
};