import mongoose from "mongoose";
import { Application } from "../models/Application.js";
import type { ApplicationStatus } from "../constants/applicationStatus.js";
import { AppError } from "../utils/AppError.js";
import { stripUndefined } from "../utils/stripUndefined.js";
import type {
  CreateApplicationBody,
  UpdateApplicationBody,
} from "../validators/applicationValidators.js";

function toPublic(app: {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: Date;
  status: ApplicationStatus;
  salaryRange: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: String(app._id),
    company: app.company,
    role: app.role,
    jdLink: app.jdLink,
    notes: app.notes,
    dateApplied: app.dateApplied.toISOString(),
    status: app.status,
    salaryRange: app.salaryRange,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

export type PublicApplication = ReturnType<typeof toPublic>;

export async function listApplications(
  userId: string
): Promise<PublicApplication[]> {
  const apps = await Application.find({ userId })
    .sort({ dateApplied: -1 })
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
  const app = await Application.findOne({ _id: id, userId }).lean();
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
    company: body.company,
    role: body.role,
    jdLink: body.jdLink ?? "",
    notes: body.notes ?? "",
    dateApplied: body.dateApplied,
    status: body.status ?? "Applied",
    salaryRange: body.salaryRange ?? "",
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
