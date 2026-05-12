import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { Audit } from "../models/Audit.js";

const router = Router();

const auditPayloadSchema = z.object({
  auditInput: z.record(z.string(), z.unknown()),
  auditResult: z.record(z.string(), z.unknown()),
  summary: z.string().min(1).max(1200)
});

router.post("/", async (req, res) => {
  const parseResult = auditPayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const { auditInput, auditResult, summary } = parseResult.data;
  const publicId = nanoid(10);

  const publicReport = {
    ...auditResult,
    summary,
    generatedAt: new Date().toISOString()
  };

  const audit = await Audit.create({
    publicId,
    publicReport,
    auditInput
  });

  const baseUrl = process.env.SHARE_BASE_URL || process.env.APP_BASE_URL || "http://localhost:5173";

  return res.status(201).json({
    publicId: audit.publicId,
    publicUrl: `${baseUrl}/share/${publicId}`
  });
});

router.get("/:publicId", async (req, res) => {
  const audit = await Audit.findOne({ publicId: req.params.publicId }).lean();
  if (!audit) {
    return res.status(404).json({ error: "not_found" });
  }

  return res.json({
    publicId: audit.publicId,
    publicReport: audit.publicReport
  });
});

export default router;
