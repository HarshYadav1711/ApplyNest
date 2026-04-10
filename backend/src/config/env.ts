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
  mongoUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  /** Access token lifetime in seconds (default 7 days) */
  jwtExpiresSeconds: Math.max(
    60,
    Number(process.env.JWT_EXPIRES_SECONDS) || 604800
  ),
  /** When unset, AI uses deterministic fallback */
  openaiApiKey: process.env.OPENAI_API_KEY?.trim() || undefined,
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
