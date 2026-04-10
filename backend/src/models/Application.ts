import mongoose, { Schema } from "mongoose";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "../constants/statuses.js";

export interface ApplicationDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  positionTitle: string;
  status: ApplicationStatus;
  notes: string;
  jobUrl: string;
  location: string;
  /** Snapshot of parsed JD fields for resume suggestions */
  parsedSummary: string;
  requiredSkills: string[];
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
    companyName: { type: String, required: true, trim: true },
    positionTitle: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: APPLICATION_STATUSES,
      default: "Applied",
    },
    notes: { type: String, default: "" },
    jobUrl: { type: String, default: "" },
    location: { type: String, default: "" },
    parsedSummary: { type: String, default: "" },
    requiredSkills: { type: [String], default: [] },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, updatedAt: -1 });

export const Application = mongoose.model<ApplicationDocument>(
  "Application",
  applicationSchema
);
