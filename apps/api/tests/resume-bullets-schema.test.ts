import { describe, expect, it } from "vitest";
import { resumeBulletsResponseSchema } from "../src/services/ai/schemas.js";

describe("resumeBulletsResponseSchema", () => {
  it("rejects invalid payloads and accepts 3–5 well-formed bullets", () => {
    const tooFew = resumeBulletsResponseSchema.safeParse({
      bullets: ["a".repeat(20), "b".repeat(20)],
    });
    expect(tooFew.success).toBe(false);

    const tooShortStrings = resumeBulletsResponseSchema.safeParse({
      bullets: ["hi", "there", "friend"],
    });
    expect(tooShortStrings.success).toBe(false);

    const ok = resumeBulletsResponseSchema.safeParse({
      bullets: ["a".repeat(15), "b".repeat(15), "c".repeat(15)],
    });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.bullets).toHaveLength(3);
    }
  });
});
