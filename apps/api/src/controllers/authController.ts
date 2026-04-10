import type { Request, Response } from "express";
import {
  getUserById,
  loginUser,
  registerUser,
} from "../services/authService.js";
import type { LoginBody, RegisterBody } from "../validators/authValidators.js";

export async function register(req: Request, res: Response): Promise<void> {
  const body = req.body as RegisterBody;
  const result = await registerUser(body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = req.body as LoginBody;
  const result = await loginUser(body);
  res.json(result);
}

export async function me(req: Request, res: Response): Promise<void> {
  const sub = req.auth?.sub;
  if (!sub) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await getUserById(sub);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ user });
}
