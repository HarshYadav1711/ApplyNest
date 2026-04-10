import mongoose, { Schema } from "mongoose";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "../constants/applicationStatus.js";

export interface ApplicationDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: Date;
  followUpDate?: Date | null;
  status: ApplicationStatus;
  salaryRange: string;
  location: string;
  seniority: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<ApplicationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    jdLink: { type: String, default: "", trim: true },
    notes: { type: String, default: "" },
    dateApplied: { type: Date, required: true },
    followUpDate: { type: Date, default: undefined },
    status: {
      type: String,
      required: true,
      enum: APPLICATION_STATUSES,
      default: "Applied",
    },
    salaryRange: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    seniority: { type: String, default: "", trim: true },
    requiredSkills: { type: [String], default: [] },
    niceToHaveSkills: { type: [String], default: [] },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, dateApplied: -1 });

export const Application = mongoose.model<ApplicationDocument>(
  "Application",
  applicationSchema
);
