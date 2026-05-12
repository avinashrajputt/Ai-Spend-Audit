import { Router } from "express";
import { z } from "zod";
import { Lead } from "../models/Lead.js";
import { sendEmail } from "../services/email.js";

const router = Router();

const leadSchema = z.object({
  email: z.string().email(),
  company: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.number().int().positive().optional(),
  auditPublicId: z.string().optional(),
  honeypot: z.string().optional()
});

router.post("/", async (req, res) => {
  const parseResult = leadSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const { honeypot, ...leadPayload } = parseResult.data;
  if (honeypot) {
    return res.status(204).send();
  }

  const lead = await Lead.create(leadPayload);

  await sendEmail({
    to: lead.email,
    subject: "Your Credex AI spend audit",
    html: "<p>Your audit is saved. Credex will reach out if we spot significant savings.</p>"
  });

  return res.status(201).json({ ok: true, id: lead.id });
});

export default router;
