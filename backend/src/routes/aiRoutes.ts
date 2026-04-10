import { Router } from "express";
import * as aiController from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  parseJobDescriptionBodySchema,
  suggestResumeBulletsBodySchema,
} from "../validators/aiValidators.js";

const r = Router();

r.use(authMiddleware);

r.post(
  "/parse-job",
  validateBody(parseJobDescriptionBodySchema),
  asyncHandler(aiController.parseJob)
);
r.post(
  "/suggest-bullets",
  validateBody(suggestResumeBulletsBodySchema),
  asyncHandler(aiController.suggestBullets)
);

export default r;
