export type RiskCategory =
  | "SAFETY"
  | "SECURITY"
  | "PRIVACY"
  | "LEGAL"
  | "FINANCIAL"
  | "REPUTATIONAL"
  | "SYSTEMIC"
  | "IRREVERSIBILITY";

export type RiskFactor = {
  factorId: string;
  category: RiskCategory;
  description: string;
  likelihood?: number;
  impact?: number;
  uncertainty?: number;
};