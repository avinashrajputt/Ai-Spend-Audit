import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import auditsRouter from "./routes/audits.js";
import leadsRouter from "./routes/leads.js";
import summaryRouter from "./routes/summary.js";
import { connectDb } from "./db.js";
import { Audit } from "./models/Audit.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;
const clientOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:5173";
const shareBaseUrl = process.env.SHARE_BASE_URL || appBaseUrl;

const helmetMiddleware = helmet as unknown as (...args: any[]) => any;
const rateLimitMiddleware = rateLimit as unknown as (...args: any[]) => any;

app.use(helmetMiddleware());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || clientOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimitMiddleware({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/", (_req, res) => res.json({ ok: true, service: "ai-spend-audit-api" }));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/share/:publicId", async (req, res) => {
  const audit = await Audit.findOne({ publicId: req.params.publicId }).lean();
  if (!audit) {
    return res.status(404).send("Not found");
  }

  const report = audit.publicReport as {
    totals?: { monthlySavings?: number; annualSavings?: number };
  };
  const monthly = report.totals?.monthlySavings ?? 0;
  const annual = report.totals?.annualSavings ?? 0;
  const title = `AI Spend Audit: $${Math.round(monthly)}/mo savings`;
  const description = `Estimated annual savings: $${Math.round(annual)}. View the full audit.`;
  const url = `${shareBaseUrl}/share/${audit.publicId}`;

  return res.status(200).send(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${url}" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta http-equiv="refresh" content="0;url=${url}" />
      <style>body{font-family:Arial, sans-serif;padding:40px;background:#f4efe6;color:#1b1b1f;}</style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>${description}</p>
      <p><a href="${url}">Open the full audit</a></p>
    </body>
  </html>`);
});
app.use("/api/audits", auditsRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/summary", summaryRouter);

const start = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await connectDb(mongoUri);

  app.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
