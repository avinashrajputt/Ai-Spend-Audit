import type { AuditInput, AuditResult, Recommendation, ToolId, ToolPlan, UseCase } from "./types";

type PlanMeta = {
  monthlyPerSeat: number | null;
  minSeats?: number;
  tier: number;
  custom?: boolean;
};

type ToolMeta = {
  name: string;
  plans: Record<ToolPlan, PlanMeta>;
  planOrder: ToolPlan[];
  creditsEligible: boolean;
};

const toolCatalog: Record<ToolId, ToolMeta> = {
  cursor: {
    name: "Cursor",
    creditsEligible: true,
    planOrder: ["Hobby", "Pro", "Business", "Enterprise"],
    plans: {
      Hobby: { monthlyPerSeat: 0, tier: 0 },
      Pro: { monthlyPerSeat: 20, tier: 1 },
      Business: { monthlyPerSeat: 40, tier: 2, minSeats: 2 },
      Enterprise: { monthlyPerSeat: null, tier: 3, custom: true },
      Individual: { monthlyPerSeat: 0, tier: 0 },
      Team: { monthlyPerSeat: 0, tier: 0 },
      Max: { monthlyPerSeat: 0, tier: 0 },
      Plus: { monthlyPerSeat: 0, tier: 0 },
      API: { monthlyPerSeat: null, tier: 0 },
      Free: { monthlyPerSeat: 0, tier: 0 },
      Ultra: { monthlyPerSeat: 0, tier: 0 }
    }
  },
  copilot: {
    name: "GitHub Copilot",
    creditsEligible: true,
    planOrder: ["Individual", "Business", "Enterprise"],
    plans: {
      Individual: { monthlyPerSeat: 10, tier: 0 },
      Business: { monthlyPerSeat: 19, tier: 1, minSeats: 2 },
      Enterprise: { monthlyPerSeat: 39, tier: 2, minSeats: 5 },
      Hobby: { monthlyPerSeat: 0, tier: 0 },
      Pro: { monthlyPerSeat: 0, tier: 0 },
      Team: { monthlyPerSeat: 0, tier: 0 },
      Max: { monthlyPerSeat: 0, tier: 0 },
      Plus: { monthlyPerSeat: 0, tier: 0 },
      API: { monthlyPerSeat: null, tier: 0 },
      Free: { monthlyPerSeat: 0, tier: 0 },
      Ultra: { monthlyPerSeat: 0, tier: 0 }
    }
  },
  claude: {
    name: "Claude",
    creditsEligible: true,
    planOrder: ["Free", "Pro", "Max", "Team", "Enterprise", "API"],
    plans: {
      Free: { monthlyPerSeat: 0, tier: 0 },
      Pro: { monthlyPerSeat: 20, tier: 1 },
      Max: { monthlyPerSeat: 60, tier: 2 },
      Team: { monthlyPerSeat: 30, tier: 3, minSeats: 5 },
      Enterprise: { monthlyPerSeat: null, tier: 4, custom: true },
      API: { monthlyPerSeat: null, tier: 5 },
      Hobby: { monthlyPerSeat: 0, tier: 0 },
      Business: { monthlyPerSeat: 0, tier: 0 },
      Individual: { monthlyPerSeat: 0, tier: 0 },
      Plus: { monthlyPerSeat: 0, tier: 0 },
      Ultra: { monthlyPerSeat: 0, tier: 0 }
    }
  },
  chatgpt: {
    name: "ChatGPT",
    creditsEligible: true,
    planOrder: ["Free", "Plus", "Team", "Enterprise", "API"],
    plans: {
      Free: { monthlyPerSeat: 0, tier: 0 },
      Plus: { monthlyPerSeat: 20, tier: 1 },
      Team: { monthlyPerSeat: 30, tier: 2, minSeats: 2 },
      Enterprise: { monthlyPerSeat: null, tier: 3, custom: true },
      API: { monthlyPerSeat: null, tier: 4 },
      Hobby: { monthlyPerSeat: 0, tier: 0 },
      Pro: { monthlyPerSeat: 0, tier: 0 },
      Business: { monthlyPerSeat: 0, tier: 0 },
      Individual: { monthlyPerSeat: 0, tier: 0 },
      Max: { monthlyPerSeat: 0, tier: 0 },
      Ultra: { monthlyPerSeat: 0, tier: 0 }
    }
  },
  anthropic_api: {
    name: "Anthropic API",
    creditsEligible: true,
    planOrder: ["API"],
    plans: {
      API: { monthlyPerSeat: null, tier: 0 },
      Hobby: { monthlyPerSeat: 0, tier: 0 },
      Pro: { monthlyPerSeat: 0, tier: 0 },
      Business: { monthlyPerSeat: 0, tier: 0 },
      Enterprise: { monthlyPerSeat: 0, tier: 0 },
      Individual: { monthlyPerSeat: 0, tier: 0 },
      Team: { monthlyPerSeat: 0, tier: 0 },
      Max: { monthlyPerSeat: 0, tier: 0 },
      Plus: { monthlyPerSeat: 0, tier: 0 },
      Free: { monthlyPerSeat: 0, tier: 0 },
      Ultra: { monthlyPerSeat: 0, tier: 0 }
    }
  },
  openai_api: {
    name: "OpenAI API",
    creditsEligible: true,
    planOrder: ["API"],
    plans: {
      API: { monthlyPerSeat: null, tier: 0 },
      Hobby: { monthlyPerSeat: 0, tier: 0 },
      Pro: { monthlyPerSeat: 0, tier: 0 },
      Business: { monthlyPerSeat: 0, tier: 0 },
      Enterprise: { monthlyPerSeat: 0, tier: 0 },
      Individual: { monthlyPerSeat: 0, tier: 0 },
      Team: { monthlyPerSeat: 0, tier: 0 },
      Max: { monthlyPerSeat: 0, tier: 0 },
      Plus: { monthlyPerSeat: 0, tier: 0 },
      Free: { monthlyPerSeat: 0, tier: 0 },
      Ultra: { monthlyPerSeat: 0, tier: 0 }
    }
  },
  gemini: {
    name: "Gemini",
    creditsEligible: true,
    planOrder: ["Pro", "Ultra", "API"],
    plans: {
      Pro: { monthlyPerSeat: 20, tier: 0 },
      Ultra: { monthlyPerSeat: 30, tier: 1 },
      API: { monthlyPerSeat: null, tier: 2 },
      Hobby: { monthlyPerSeat: 0, tier: 0 },
      Business: { monthlyPerSeat: 0, tier: 0 },
      Enterprise: { monthlyPerSeat: 0, tier: 0 },
      Individual: { monthlyPerSeat: 0, tier: 0 },
      Team: { monthlyPerSeat: 0, tier: 0 },
      Max: { monthlyPerSeat: 0, tier: 0 },
      Plus: { monthlyPerSeat: 0, tier: 0 },
      Free: { monthlyPerSeat: 0, tier: 0 }
    }
  },
  windsurf: {
    name: "Windsurf",
    creditsEligible: true,
    planOrder: ["Pro", "Team", "Enterprise"],
    plans: {
      Pro: { monthlyPerSeat: 15, tier: 0 },
      Team: { monthlyPerSeat: 30, tier: 1, minSeats: 2 },
      Enterprise: { monthlyPerSeat: null, tier: 2, custom: true },
      Hobby: { monthlyPerSeat: 0, tier: 0 },
      Business: { monthlyPerSeat: 0, tier: 0 },
      Individual: { monthlyPerSeat: 0, tier: 0 },
      Max: { monthlyPerSeat: 0, tier: 0 },
      Plus: { monthlyPerSeat: 0, tier: 0 },
      API: { monthlyPerSeat: null, tier: 0 },
      Free: { monthlyPerSeat: 0, tier: 0 },
      Ultra: { monthlyPerSeat: 0, tier: 0 }
    }
  }
};

const alternativePlans: Record<UseCase, Array<{ toolId: ToolId; plan: ToolPlan }>> = {
  coding: [
    { toolId: "copilot", plan: "Individual" },
    { toolId: "cursor", plan: "Pro" },
    { toolId: "windsurf", plan: "Pro" }
  ],
  writing: [
    { toolId: "chatgpt", plan: "Plus" },
    { toolId: "claude", plan: "Pro" },
    { toolId: "gemini", plan: "Pro" }
  ],
  data: [
    { toolId: "chatgpt", plan: "Plus" },
    { toolId: "claude", plan: "Pro" },
    { toolId: "gemini", plan: "Pro" }
  ],
  research: [
    { toolId: "claude", plan: "Pro" },
    { toolId: "chatgpt", plan: "Plus" },
    { toolId: "gemini", plan: "Pro" }
  ],
  mixed: [
    { toolId: "chatgpt", plan: "Team" },
    { toolId: "claude", plan: "Team" },
    { toolId: "gemini", plan: "Pro" }
  ]
};

const getPlanMeta = (toolId: ToolId, plan: ToolPlan) => toolCatalog[toolId].plans[plan];

const estimateSeatCost = (toolId: ToolId, plan: ToolPlan, seats: number) => {
  const planMeta = getPlanMeta(toolId, plan);
  if (planMeta.monthlyPerSeat === null) {
    return null;
  }
  return planMeta.monthlyPerSeat * Math.max(seats, 1);
};

const pickDowngradePlan = (toolId: ToolId, plan: ToolPlan, seats: number) => {
  const { planOrder } = toolCatalog[toolId];
  const currentIndex = planOrder.indexOf(plan);
  if (currentIndex <= 0) {
    return null;
  }

  for (let i = currentIndex - 1; i >= 0; i -= 1) {
    const candidate = planOrder[i];
    const meta = getPlanMeta(toolId, candidate);
    const minSeats = meta.minSeats ?? 1;
    if (meta.monthlyPerSeat !== null && seats >= minSeats) {
      return candidate;
    }
  }

  return null;
};

const creditSavings = (currentMonthly: number) => {
  const discount = 0.2;
  return currentMonthly * discount;
};

const buildRecommendation = (params: {
  toolId: ToolId;
  toolName: string;
  currentMonthly: number;
  recommendedMonthly: number;
  reason: string;
  action: string;
  category: Recommendation["category"];
}): Recommendation => {
  const savingsMonthly = Math.max(params.currentMonthly - params.recommendedMonthly, 0);

  return {
    toolId: params.toolId,
    toolName: params.toolName,
    currentMonthly: params.currentMonthly,
    recommendedMonthly: params.recommendedMonthly,
    savingsMonthly,
    savingsAnnual: savingsMonthly * 12,
    reason: params.reason,
    action: params.action,
    category: params.category
  };
};

export const runAudit = (input: AuditInput): AuditResult => {
  const recommendations: Recommendation[] = [];

  input.tools
    .filter((tool) => tool.enabled)
    .forEach((tool) => {
      const meta = toolCatalog[tool.toolId];
      const planMeta = getPlanMeta(tool.toolId, tool.plan);
      const seats = tool.seats || 1;
      const estimatedSeatCost = estimateSeatCost(tool.toolId, tool.plan, seats);
      const currentMonthly = tool.monthlySpend > 0 ? tool.monthlySpend : estimatedSeatCost ?? 0;

      const options: Recommendation[] = [];

      options.push(
        buildRecommendation({
          toolId: tool.toolId,
          toolName: meta.name,
          currentMonthly,
          recommendedMonthly: currentMonthly,
          reason: "Current plan matches your team size and usage.",
          action: "Keep current",
          category: "keep"
        })
      );

      const minSeats = planMeta.minSeats ?? 1;
      if (planMeta.monthlyPerSeat !== null && seats < minSeats) {
        const downgrade = pickDowngradePlan(tool.toolId, tool.plan, seats);
        if (downgrade) {
          const downgradeMonthly = estimateSeatCost(tool.toolId, downgrade, seats) ?? currentMonthly;
          options.push(
            buildRecommendation({
              toolId: tool.toolId,
              toolName: meta.name,
              currentMonthly,
              recommendedMonthly: downgradeMonthly,
              reason: `Team size is below the ${tool.plan} minimum seat requirement.`,
              action: `Downgrade to ${downgrade}`,
              category: "downgrade"
            })
          );
        }
      }

      if (planMeta.monthlyPerSeat !== null && seats <= 2 && planMeta.tier >= 2) {
        const downgrade = pickDowngradePlan(tool.toolId, tool.plan, seats);
        if (downgrade) {
          const downgradeMonthly = estimateSeatCost(tool.toolId, downgrade, seats) ?? currentMonthly;
          options.push(
            buildRecommendation({
              toolId: tool.toolId,
              toolName: meta.name,
              currentMonthly,
              recommendedMonthly: downgradeMonthly,
              reason: "Smaller teams rarely need the higher tier feature set.",
              action: `Right-size to ${downgrade}`,
              category: "downgrade"
            })
          );
        }
      }

      const alternativeList = alternativePlans[input.useCase];
      const cheapestAlternative = alternativeList
        .map((alt) => ({
          ...alt,
          monthly: estimateSeatCost(alt.toolId, alt.plan, seats) ?? currentMonthly
        }))
        .sort((a, b) => a.monthly - b.monthly)[0];

      if (cheapestAlternative && cheapestAlternative.monthly < currentMonthly * 0.75) {
        options.push(
          buildRecommendation({
            toolId: tool.toolId,
            toolName: meta.name,
            currentMonthly,
            recommendedMonthly: cheapestAlternative.monthly,
            reason: `Comparable ${input.useCase} workflows are cheaper on ${toolCatalog[cheapestAlternative.toolId].name}.`,
            action: `Switch to ${toolCatalog[cheapestAlternative.toolId].name} ${cheapestAlternative.plan}`,
            category: "switch"
          })
        );
      }

      if (meta.creditsEligible && currentMonthly >= 500) {
        const savings = creditSavings(currentMonthly);
        options.push(
          buildRecommendation({
            toolId: tool.toolId,
            toolName: meta.name,
            currentMonthly,
            recommendedMonthly: currentMonthly - savings,
            reason: "Bulk credits typically discount enterprise AI spend by ~20%.",
            action: "Use discounted credits",
            category: "credits"
          })
        );
      }

      if (estimatedSeatCost && currentMonthly > estimatedSeatCost * 1.15) {
        options.push(
          buildRecommendation({
            toolId: tool.toolId,
            toolName: meta.name,
            currentMonthly,
            recommendedMonthly: estimatedSeatCost,
            reason: "Your reported spend is above list pricing for this plan.",
            action: "Check billing for unused seats",
            category: "optimize"
          })
        );
      }

      const best = options.sort((a, b) => b.savingsMonthly - a.savingsMonthly)[0];
      recommendations.push(best);
    });

  const totals = recommendations.reduce(
    (acc, rec) => {
      acc.currentMonthly += rec.currentMonthly;
      acc.recommendedMonthly += rec.recommendedMonthly;
      return acc;
    },
    { currentMonthly: 0, recommendedMonthly: 0 }
  );

  const monthlySavings = Math.max(totals.currentMonthly - totals.recommendedMonthly, 0);

  return {
    recommendations,
    totals: {
      currentMonthly: totals.currentMonthly,
      recommendedMonthly: totals.recommendedMonthly,
      monthlySavings,
      annualSavings: monthlySavings * 12
    }
  };
};
