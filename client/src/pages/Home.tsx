import { useEffect, useMemo, useState } from "react";
import { runAudit } from "../audit/engine";
import type { AuditInput, AuditResult, ToolId, ToolPlan, UseCase } from "../audit/types";
import { createAudit, createLead, requestSummary } from "../lib/api";

const toolOrder: Array<{ id: ToolId; label: string; plans: ToolPlan[] }> = [
  { id: "cursor", label: "Cursor", plans: ["Hobby", "Pro", "Business", "Enterprise"] },
  { id: "copilot", label: "GitHub Copilot", plans: ["Individual", "Business", "Enterprise"] },
  { id: "claude", label: "Claude", plans: ["Free", "Pro", "Max", "Team", "Enterprise", "API"] },
  { id: "chatgpt", label: "ChatGPT", plans: ["Free", "Plus", "Team", "Enterprise", "API"] },
  { id: "anthropic_api", label: "Anthropic API", plans: ["API"] },
  { id: "openai_api", label: "OpenAI API", plans: ["API"] },
  { id: "gemini", label: "Gemini", plans: ["Pro", "Ultra", "API"] },
  { id: "windsurf", label: "Windsurf", plans: ["Pro", "Team", "Enterprise"] }
];

const defaultTools = toolOrder.map((tool) => ({
  toolId: tool.id,
  enabled: false,
  plan: tool.plans[0],
  monthlySpend: 0,
  seats: 1
}));

const defaultInput: AuditInput = {
  teamSize: 3,
  useCase: "coding",
  tools: defaultTools
};

const storageKey = "credex-audit-input";

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

const SummaryCard = ({ audit, summary }: { audit: AuditResult; summary: string }) => {
  const heroClass = audit.totals.monthlySavings > 500 ? "hero-savings" : "hero-okay";
  return (
    <section className={`hero ${heroClass}`}>
      <div>
        <p className="eyebrow">AI Spend Audit</p>
        <h1>
          {formatCurrency(audit.totals.monthlySavings)} / month
          <span> in potential savings</span>
        </h1>
        <p className="subhead">
          Annualized savings: {formatCurrency(audit.totals.annualSavings)}. {summary}
        </p>
      </div>
      <div className="hero-metrics">
        <div>
          <span>Current spend</span>
          <strong>{formatCurrency(audit.totals.currentMonthly)}</strong>
        </div>
        <div>
          <span>Recommended spend</span>
          <strong>{formatCurrency(audit.totals.recommendedMonthly)}</strong>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [input, setInput] = useState<AuditInput>(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      return defaultInput;
    }
    try {
      return JSON.parse(saved) as AuditInput;
    } catch {
      return defaultInput;
    }
  });
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [summary, setSummary] = useState<string>(
    "Generate your audit to see a tailored summary."
  );
  const [shareUrl, setShareUrl] = useState<string>("");
  const [leadStatus, setLeadStatus] = useState<string>("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(input));
  }, [input]);

  const selectedTools = useMemo(() => input.tools.filter((tool) => tool.enabled), [input]);
  const canRunAudit = selectedTools.length > 0;

  const handleToolUpdate = (toolId: ToolId, update: Partial<(typeof input.tools)[number]>) => {
    setInput((prev) => ({
      ...prev,
      tools: prev.tools.map((tool) => (tool.toolId === toolId ? { ...tool, ...update } : tool))
    }));
  };

  const handleAudit = async () => {
    const result = runAudit(input);
    setAudit(result);
    setSummary("Generating summary...");
    setShareUrl("");

    try {
      const summaryResponse = await requestSummary(input, result);
      setSummary(summaryResponse.summary);
      const auditResponse = await createAudit(input, result, summaryResponse.summary);
      setShareUrl(auditResponse.publicUrl);
    } catch {
      const fallback =
        "Your audit is ready. We found a few right-sizing opportunities worth reviewing.";
      setSummary(fallback);
      try {
        const auditResponse = await createAudit(input, result, fallback);
        setShareUrl(auditResponse.publicUrl);
      } catch {
        setShareUrl("");
      }
    }
  };

  const handleLeadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLeadStatus("Saving...");
    const formData = new FormData(event.currentTarget);
    try {
      await createLead({
        email: String(formData.get("email")),
        company: String(formData.get("company") || ""),
        role: String(formData.get("role") || ""),
        teamSize: Number(formData.get("teamSize") || 0) || undefined,
        auditPublicId: shareUrl ? shareUrl.split("/").pop() : undefined,
        honeypot: String(formData.get("website") || "")
      });
      setLeadStatus("Saved. Check your inbox for a confirmation.");
      event.currentTarget.reset();
    } catch {
      setLeadStatus("Something went wrong. Try again.");
    }
  };

  return (
    <main className="page">
      <header className="hero-wrap">
        <div className="brand">Credex Labs</div>
        <div className="hero-copy">
          <p className="eyebrow">Free tool</p>
          <h1>SpendSight: the AI spend audit for fast-moving teams.</h1>
          <p>
            Benchmark your AI tool stack, spot waste, and lock in savings before your next
            invoice hits.
          </p>
        </div>
        <div className="hero-cta">
          <button className="primary" onClick={handleAudit} disabled={!canRunAudit}>
            Run my audit
          </button>
          <p className="micro">No login. Takes ~2 minutes.</p>
        </div>
      </header>

      <section className="form-grid">
        <div className="card">
          <h2>Team snapshot</h2>
          <label>
            Team size
            <input
              type="number"
              min={1}
              value={input.teamSize}
              onChange={(event) => setInput({ ...input, teamSize: Number(event.target.value) })}
            />
          </label>
          <label>
            Primary use case
            <select
              value={input.useCase}
              onChange={(event) => setInput({ ...input, useCase: event.target.value as UseCase })}
            >
              <option value="coding">Coding</option>
              <option value="writing">Writing</option>
              <option value="data">Data</option>
              <option value="research">Research</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
        </div>

        <div className="card">
          <h2>AI stack</h2>
          <p className="muted">Select the tools you currently pay for.</p>
          <div className="tool-grid">
            {toolOrder.map((tool) => {
              const toolState = input.tools.find((item) => item.toolId === tool.id)!;
              return (
                <div key={tool.id} className={toolState.enabled ? "tool active" : "tool"}>
                  <div className="tool-row">
                    <label className="tool-toggle">
                      <input
                        type="checkbox"
                        checked={toolState.enabled}
                        onChange={(event) =>
                          handleToolUpdate(tool.id, { enabled: event.target.checked })
                        }
                      />
                      <span>{tool.label}</span>
                    </label>
                    <select
                      value={toolState.plan}
                      onChange={(event) =>
                        handleToolUpdate(tool.id, { plan: event.target.value as ToolPlan })
                      }
                      disabled={!toolState.enabled}
                    >
                      {tool.plans.map((plan) => (
                        <option key={plan} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="tool-fields">
                    <label>
                      Monthly spend (USD)
                      <input
                        type="number"
                        min={0}
                        value={toolState.monthlySpend}
                        onChange={(event) =>
                          handleToolUpdate(tool.id, { monthlySpend: Number(event.target.value) })
                        }
                        disabled={!toolState.enabled}
                      />
                    </label>
                    <label>
                      Seats
                      <input
                        type="number"
                        min={1}
                        value={toolState.seats}
                        onChange={(event) =>
                          handleToolUpdate(tool.id, { seats: Number(event.target.value) })
                        }
                        disabled={!toolState.enabled}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="action-bar">
        <button className="primary" onClick={handleAudit} disabled={!canRunAudit}>
          Generate audit
        </button>
        <p className="micro">
          Form state is saved automatically. Pick at least one tool to continue.
        </p>
      </section>

      {audit && (
        <section className="results">
          <SummaryCard audit={audit} summary={summary} />

          <div className="card">
            <h2>Per-tool recommendations</h2>
            <div className="recommendations">
              {audit.recommendations.map((rec) => (
                <div key={rec.toolId} className="recommendation">
                  <div>
                    <h3>{rec.toolName}</h3>
                    <p>{rec.reason}</p>
                  </div>
                  <div className="recommendation-metrics">
                    <span>{rec.action}</span>
                    <strong>{formatCurrency(rec.savingsMonthly)} / mo</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Next steps</h2>
            <p>
              {audit.totals.monthlySavings > 500
                ? "You are leaving serious savings on the table. Credex can broker discounted credits and vendor swaps to lock in savings fast."
                : audit.totals.monthlySavings < 100
                ? "You are spending well. We will notify you as pricing and plans change."
                : "You have some savings potential. A quick review with Credex can validate the swap options."}
            </p>
            <div className="cta-row">
              <a
                className="secondary"
                href="https://credex.rocks"
                target="_blank"
                rel="noreferrer"
              >
                Book Credex consult
              </a>
              {shareUrl && (
                <a className="ghost" href={shareUrl} target="_blank" rel="noreferrer">
                  Share audit link
                </a>
              )}
            </div>
          </div>

          <div className="card">
            <h2>Save the report</h2>
            <form className="lead-form" onSubmit={handleLeadSubmit}>
              <input type="text" name="website" className="honeypot" tabIndex={-1} />
              <label>
                Work email
                <input type="email" name="email" required />
              </label>
              <div className="lead-grid">
                <label>
                  Company
                  <input type="text" name="company" />
                </label>
                <label>
                  Role
                  <input type="text" name="role" />
                </label>
                <label>
                  Team size
                  <input type="number" name="teamSize" min={1} />
                </label>
              </div>
              <button className="primary" type="submit">
                Email me the report
              </button>
              {leadStatus && <p className="micro">{leadStatus}</p>}
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
