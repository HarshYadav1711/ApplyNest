import { Router } from "express";
import * as healthController from "../controllers/healthController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const r = Router();

r.get("/health", asyncHandler(healthController.getHealth));

export default r;
