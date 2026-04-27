import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("environment is testable", () => {
    expect(1 + 1).toBe(2);
  });
});
