import mongoose from "mongoose";
import { Application } from "../models/Application.js";
import type { ApplicationStatus } from "../constants/statuses.js";
import { AppError } from "../utils/AppError.js";
import { stripUndefined } from "../utils/stripUndefined.js";
import type {
  CreateApplicationBody,
  UpdateApplicationBody,
} from "../validators/applicationValidators.js";

function toPublic(app: {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  companyName: string;
  positionTitle: string;
  status: ApplicationStatus;
  notes: string;
  jobUrl: string;
  location: string;
  parsedSummary: string;
  requiredSkills: string[];
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: String(app._id),
    companyName: app.companyName,
    positionTitle: app.positionTitle,
    status: app.status,
    notes: app.notes,
    jobUrl: app.jobUrl,
    location: app.location,
    parsedSummary: app.parsedSummary,
    requiredSkills: app.requiredSkills,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

export type PublicApplication = ReturnType<typeof toPublic>;

export async function listApplications(
  userId: string
): Promise<PublicApplication[]> {
  const apps = await Application.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();
  return apps.map((a) =>
    toPublic({
      ...a,
      _id: a._id as mongoose.Types.ObjectId,
      userId: a.userId as mongoose.Types.ObjectId,
    })
  );
}

export async function getApplication(
  userId: string,
  id: string
): Promise<PublicApplication> {
  const app = await Application.findOne({
    _id: id,
    userId,
  }).lean();
  if (!app) {
    throw new AppError(404, "Application not found");
  }
  return toPublic({
    ...app,
    _id: app._id as mongoose.Types.ObjectId,
    userId: app.userId as mongoose.Types.ObjectId,
  });
}

export async function createApplication(
  userId: string,
  body: CreateApplicationBody
): Promise<PublicApplication> {
  const app = await Application.create({
    userId,
    companyName: body.companyName,
    positionTitle: body.positionTitle,
    status: body.status ?? "Applied",
    notes: body.notes ?? "",
    jobUrl: body.jobUrl ?? "",
    location: body.location ?? "",
    parsedSummary: body.parsedSummary ?? "",
    requiredSkills: body.requiredSkills ?? [],
  });
  return toPublic(app);
}

export async function updateApplication(
  userId: string,
  id: string,
  body: UpdateApplicationBody
): Promise<PublicApplication> {
  const app = await Application.findOneAndUpdate(
    { _id: id, userId },
    { $set: stripUndefined(body as Record<string, unknown>) },
    { new: true, runValidators: true }
  ).lean();
  if (!app) {
    throw new AppError(404, "Application not found");
  }
  return toPublic({
    ...app,
    _id: app._id as mongoose.Types.ObjectId,
    userId: app.userId as mongoose.Types.ObjectId,
  });
}

export async function deleteApplication(
  userId: string,
  id: string
): Promise<void> {
  const res = await Application.deleteOne({ _id: id, userId });
  if (res.deletedCount === 0) {
    throw new AppError(404, "Application not found");
  }
}
