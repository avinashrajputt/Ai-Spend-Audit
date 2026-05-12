import mongoose, { Schema } from "mongoose";

export type AuditDocument = mongoose.Document & {
  publicId: string;
  publicReport: Record<string, unknown>;
  auditInput: Record<string, unknown>;
  createdAt: Date;
};

const AuditSchema = new Schema<AuditDocument>(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    publicReport: { type: Schema.Types.Mixed, required: true },
    auditInput: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const Audit = mongoose.model<AuditDocument>("Audit", AuditSchema);
