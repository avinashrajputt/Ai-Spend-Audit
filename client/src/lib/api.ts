import type { AuditInput, AuditResult } from "../audit/types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
const buildUrl = (path: string) => `${apiBaseUrl}${path}`;

export const requestSummary = async (auditInput: AuditInput, auditResult: AuditResult) => {
  const response = await fetch(buildUrl("/api/summary"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ auditInput, auditResult })
  });

  if (!response.ok) {
    throw new Error("summary_failed");
  }

  return (await response.json()) as { summary: string; source: string };
};

export const createAudit = async (
  auditInput: AuditInput,
  auditResult: AuditResult,
  summary: string
) => {
  const response = await fetch(buildUrl("/api/audits"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ auditInput, auditResult, summary })
  });

  if (!response.ok) {
    throw new Error("audit_store_failed");
  }

  return (await response.json()) as { publicId: string; publicUrl: string };
};

export const createLead = async (payload: {
  email: string;
  company?: string;
  role?: string;
  teamSize?: number;
  auditPublicId?: string;
  honeypot?: string;
}) => {
  const response = await fetch(buildUrl("/api/leads"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("lead_failed");
  }

  return response.status === 204 ? { ok: true } : await response.json();
};

export const fetchPublicAudit = async (publicId: string) => {
  const response = await fetch(buildUrl(`/api/audits/${publicId}`));
  if (!response.ok) {
    throw new Error("audit_not_found");
  }

  return (await response.json()) as { publicReport: AuditResult; publicId: string };
};
