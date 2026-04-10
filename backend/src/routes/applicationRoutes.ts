import { Router } from "express";
import * as applicationController from "../controllers/applicationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateParams } from "../middleware/validateParams.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  applicationIdParamsSchema,
  createApplicationBodySchema,
  updateApplicationBodySchema,
} from "../validators/applicationValidators.js";

const r = Router();

r.use(authMiddleware);

r.get("/", asyncHandler(applicationController.list));
r.get(
  "/:id",
  validateParams(applicationIdParamsSchema),
  asyncHandler(applicationController.getOne)
);
r.post(
  "/",
  validateBody(createApplicationBodySchema),
  asyncHandler(applicationController.create)
);
r.patch(
  "/:id",
  validateParams(applicationIdParamsSchema),
  validateBody(updateApplicationBodySchema),
  asyncHandler(applicationController.update)
);
r.delete(
  "/:id",
  validateParams(applicationIdParamsSchema),
  asyncHandler(applicationController.remove)
);

export default r;
