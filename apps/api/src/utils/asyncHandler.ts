import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Wrap route handlers (sync or async) so rejections reach Express error middleware. */
export function asyncHandler(
  fn: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void | Promise<void>
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}
