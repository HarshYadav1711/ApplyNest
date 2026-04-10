import { afterEach, describe, expect, it, vi } from "vitest";

describe("parseJobDescription fallback", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns deterministic parsed fields when OPENAI_API_KEY is unset", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv(
      "MONGODB_URI",
      "mongodb://127.0.0.1:27017/vitest-parse-job-not-used"
    );
    vi.stubEnv("JWT_SECRET", "test-jwt-secret-minimum-32-characters-long");
    vi.resetModules();

    const { parseJobDescription } = await import(
      "../src/services/ai/parseJobDescription.js"
    );

    const jd = `Acme Corp
Senior React Engineer — Platform Team

We use React, TypeScript, and AWS daily. Remote-friendly.`;

    const out = await parseJobDescription(jd);

    expect(out.role.toLowerCase()).toMatch(/engineer|react/);
    expect(
      out.requiredSkills.some((s) => /react|typescript|aws/i.test(s))
    ).toBe(true);
    expect(out.requiredSkills.length).toBeGreaterThan(0);
  });
});
