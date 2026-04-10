import type { Request, Response } from "express";
import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication,
} from "../services/applicationService.js";
import { AppError } from "../utils/AppError.js";
import type {
  CreateApplicationBody,
  UpdateApplicationBody,
} from "../validators/applicationValidators.js";

function requireUserId(req: Request): string {
  const id = req.auth?.sub;
  if (!id) throw new AppError(401, "Unauthorized");
  return id;
}

export async function list(req: Request, res: Response): Promise<void> {
  const apps = await listApplications(requireUserId(req));
  res.json({ applications: apps });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const app = await getApplication(requireUserId(req), id);
  res.json({ application: app });
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateApplicationBody;
  const app = await createApplication(requireUserId(req), body);
  res.status(201).json({ application: app });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const body = req.body as UpdateApplicationBody;
  const app = await updateApplication(requireUserId(req), id, body);
  res.json({ application: app });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await deleteApplication(requireUserId(req), id);
  res.status(204).send();
}
