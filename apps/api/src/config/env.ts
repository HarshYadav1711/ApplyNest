import { config } from "dotenv";

config();

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  mongoUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresSeconds: Math.max(
    60,
    Number(process.env.JWT_EXPIRES_SECONDS) || 604800
  ),
  /** When unset, JD parsing uses a deterministic fallback (no paid API). */
  openaiApiKey: process.env.OPENAI_API_KEY?.trim() || undefined,
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
};
