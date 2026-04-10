import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

interface AccessPayload extends jwt.JwtPayload {
  sub: string;
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    next(new AppError(401, "Unauthorized"));
    return;
  }
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AccessPayload;
    if (!decoded.sub) {
      next(new AppError(401, "Invalid token"));
      return;
    }
    req.auth = decoded;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}
