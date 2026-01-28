import { RiskLevel } from "./riskTypes";
import { RiskFactor } from "./riskFactors";

export type RiskAssessment = {
  assessmentId: string;
  targetAction: string;
  assessedAt: number;
  overallLevel: RiskLevel;
  factors: RiskFactor[];
  uncertaintyFlag?: boolean;
  notes?: string;
};

export type RiskClaim = {
  claimedAssessmentId: string;
  claimedLevel: RiskLevel;
};