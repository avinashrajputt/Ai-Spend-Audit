import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { AuditResult } from "../audit/types";
import { fetchPublicAudit } from "../lib/api";

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

export default function Share() {
  const { publicId } = useParams();
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    if (!publicId) {
      return;
    }

    fetchPublicAudit(publicId)
      .then((data) => {
        setAudit(data.publicReport);
      })
      .catch(() => setStatus("Audit not found."));
  }, [publicId]);

  if (!audit) {
    return (
      <main className="page">
        <div className="card">
          <p>{status}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="card">
        <h1>Shared AI Spend Audit</h1>
        <p className="muted">Public view. Private details removed.</p>
        <div className="share-summary">
          <div>
            <span>Monthly savings</span>
            <strong>{formatCurrency(audit.totals.monthlySavings)}</strong>
          </div>
          <div>
            <span>Annual savings</span>
            <strong>{formatCurrency(audit.totals.annualSavings)}</strong>
          </div>
        </div>
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
    </main>
  );
}
