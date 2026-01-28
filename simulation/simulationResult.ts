import { SimulationMode } from "./simulationTypes";
import { SimulationOutcome } from "./simulationOutcome";

export type SimulationResult = {
  simulationId: string;
  targetAction: string;
  mode: SimulationMode;
  simulatedAt: number;
  outcomes: SimulationOutcome[];
  recommendation?: "PROCEED" | "REVISE" | "ABORT";
  uncertaintyLevel?: "LOW" | "MEDIUM" | "HIGH";
  notes?: string;
};

export type SimulationClaim = {
  claimedSimulationId: string;
  claimedMode: SimulationMode;
};