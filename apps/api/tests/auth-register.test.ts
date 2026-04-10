import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Narrow mock: persistence only — bcrypt + JWT still run like production. */
const findOne = vi.fn();
const create = vi.fn();

vi.mock("../src/models/User.js", () => ({
  User: {
    findOne: (...args: unknown[]) => findOne(...args),
    create: (...args: unknown[]) => create(...args),
  },
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    findOne.mockReset();
    create.mockReset();
    findOne.mockResolvedValue(null);
    create.mockImplementation((doc: { email: string }) =>
      Promise.resolve({
        id: "507f1f77bcf86cd799439011",
        email: doc.email.toLowerCase(),
      })
    );

    process.env.MONGODB_URI =
      "mongodb://127.0.0.1:27017/vitest-auth-not-connected";
    process.env.JWT_SECRET = "test-jwt-secret-minimum-32-characters-long";
    process.env.CORS_ORIGIN = "http://localhost:5173";
  });

  it("returns 201 with accessToken and user", async () => {
    const { createApp } = await import("../src/app.js");
    const app = createApp();

    const email = `candidate-${Date.now()}@applynest.test`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password: "password123" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toMatch(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
    );
    expect(res.body.user).toEqual({
      id: "507f1f77bcf86cd799439011",
      email: email.toLowerCase(),
    });
    expect(create).toHaveBeenCalledOnce();
  });
});
