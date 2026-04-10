import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginBodySchema, registerBodySchema } from "../validators/authValidators.js";

const r = Router();

r.post(
  "/register",
  validateBody(registerBodySchema),
  asyncHandler(authController.register)
);
r.post(
  "/login",
  validateBody(loginBodySchema),
  asyncHandler(authController.login)
);
r.get("/me", authMiddleware, asyncHandler(authController.me));

export default r;
