import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }
    req.params = parsed.data as Request["params"];
    next();
  };
}
