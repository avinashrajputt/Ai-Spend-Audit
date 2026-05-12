import mongoose, { Schema } from "mongoose";

export type LeadDocument = mongoose.Document & {
  email: string;
  company?: string;
  role?: string;
  teamSize?: number;
  auditPublicId?: string;
  createdAt: Date;
};

const LeadSchema = new Schema<LeadDocument>(
  {
    email: { type: String, required: true, index: true },
    company: { type: String },
    role: { type: String },
    teamSize: { type: Number },
    auditPublicId: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const Lead = mongoose.model<LeadDocument>("Lead", LeadSchema);
