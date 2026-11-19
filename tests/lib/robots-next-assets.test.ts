import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots.txt", () => {
  it("does not block /_next (JS/CSS needed for rendering)", () => {
    const rules = robots().rules;
    const list = Array.isArray(rules) ? rules : [rules];
    const disallowed = list.flatMap((r) => [r.disallow ?? []].flat());
    expect(disallowed).not.toContain("/_next");
    expect(disallowed).toContain("/b2b");
    expect(disallowed).toContain("/admin");
  });
});
