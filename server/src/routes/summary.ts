import { Router } from "express";
import { z } from "zod";

const router = Router();

const summarySchema = z.object({
  auditInput: z.record(z.string(), z.unknown()),
  auditResult: z.record(z.string(), z.unknown())
});

const buildFallbackSummary = (auditResult: Record<string, unknown>) => {
  const totals = auditResult.totals as
    | { monthlySavings?: number; annualSavings?: number }
    | undefined;
  const monthly = totals?.monthlySavings ?? 0;
  const annual = totals?.annualSavings ?? 0;

  return `Your audit highlights approximately $${monthly.toFixed(0)} in monthly savings ($${annual.toFixed(
    0
  )} annually). We focused on right-sizing plans, removing unused seats, and replacing API spend with credit-backed alternatives where possible.`;
};

router.post("/", async (req, res) => {
  const parseResult = summarySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const { auditInput, auditResult } = parseResult.data;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.json({ summary: buildFallbackSummary(auditResult), source: "fallback" });
  }

  const prompt = `You are an AI finance analyst. Write a 90-120 word summary of the audit results for a startup team. Be concise, specific, and neutral. Mention total monthly and annual savings, one or two specific plan changes, and whether Credex credits could reduce cost. Use plain language.\n\nAudit input: ${JSON.stringify(
    auditInput
  )}\n\nAudit result: ${JSON.stringify(auditResult)}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 250,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      return res.json({ summary: buildFallbackSummary(auditResult), source: "fallback" });
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text: string }>;
    };

    const text = data.content?.find((item) => item.type === "text")?.text;
    if (!text) {
      return res.json({ summary: buildFallbackSummary(auditResult), source: "fallback" });
    }

    return res.json({ summary: text.trim(), source: "anthropic" });
  } catch (error) {
    return res.json({ summary: buildFallbackSummary(auditResult), source: "fallback" });
  }
});

export default router;
