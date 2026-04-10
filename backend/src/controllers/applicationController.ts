import type { Request, Response } from "express";
import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication,
} from "../services/applicationService.js";
import type {
  CreateApplicationBody,
  UpdateApplicationBody,
} from "../validators/applicationValidators.js";

export async function list(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const apps = await listApplications(userId);
  res.json({ applications: apps });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params as { id: string };
  const app = await getApplication(userId, id);
  res.json({ application: app });
}

export async function create(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = req.body as CreateApplicationBody;
  const app = await createApplication(userId, body);
  res.status(201).json({ application: app });
}

export async function update(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params as { id: string };
  const body = req.body as UpdateApplicationBody;
  const app = await updateApplication(userId, id, body);
  res.json({ application: app });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params as { id: string };
  await deleteApplication(userId, id);
  res.status(204).send();
}
