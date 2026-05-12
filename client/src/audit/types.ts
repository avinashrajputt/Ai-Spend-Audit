export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type ToolPlan =
  | "Hobby"
  | "Pro"
  | "Business"
  | "Enterprise"
  | "Individual"
  | "Team"
  | "Max"
  | "Plus"
  | "API"
  | "Free"
  | "Ultra";

export type ToolInput = {
  toolId: ToolId;
  enabled: boolean;
  plan: ToolPlan;
  monthlySpend: number;
  seats: number;
};

export type AuditInput = {
  teamSize: number;
  useCase: UseCase;
  tools: ToolInput[];
};

export type RecommendationCategory = "keep" | "downgrade" | "switch" | "credits" | "optimize";

export type Recommendation = {
  toolId: ToolId;
  toolName: string;
  currentMonthly: number;
  recommendedMonthly: number;
  savingsMonthly: number;
  savingsAnnual: number;
  action: string;
  reason: string;
  category: RecommendationCategory;
};

export type AuditTotals = {
  currentMonthly: number;
  recommendedMonthly: number;
  monthlySavings: number;
  annualSavings: number;
};

export type AuditResult = {
  totals: AuditTotals;
  recommendations: Recommendation[];
};
