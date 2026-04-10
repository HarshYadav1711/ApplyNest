import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import type { LoginBody, RegisterBody } from "../validators/authValidators.js";

const SALT_ROUNDS = 12;

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  user: AuthUser;
}

function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresSeconds,
  });
}

export async function registerUser(body: RegisterBody): Promise<AuthTokens> {
  const existing = await User.findOne({ email: body.email.toLowerCase() });
  if (existing) {
    throw new AppError(409, "An account with this email already exists");
  }
  const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
  const user = await User.create({
    email: body.email.toLowerCase(),
    passwordHash,
  });
  const accessToken = signAccessToken(user.id);
  return {
    accessToken,
    user: { id: user.id, email: user.email },
  };
}

export async function loginUser(body: LoginBody): Promise<AuthTokens> {
  const user = await User.findOne({ email: body.email.toLowerCase() });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }
  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, "Invalid email or password");
  }
  const accessToken = signAccessToken(user.id);
  return {
    accessToken,
    user: { id: user.id, email: user.email },
  };
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const user = await User.findById(userId).lean();
  if (!user) return null;
  return { id: String(user._id), email: user.email };
}
