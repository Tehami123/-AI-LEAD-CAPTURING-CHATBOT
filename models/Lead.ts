import { Schema, model, models } from "mongoose";

const LeadSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String },
  phone: { type: String },
  transcript: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const Lead = models.Lead || model("Lead", LeadSchema);