import { describe, expect, it } from "vitest";
import { calculateSlaDueAt, getSlaStatus, SLA_HOURS_BY_PRIORITY } from "./sla";

describe("SLA", () => {
  it("uses correct hours per priority", () => {
    expect(SLA_HOURS_BY_PRIORITY.LOW).toBe(72);
    expect(SLA_HOURS_BY_PRIORITY.MEDIUM).toBe(48);
    expect(SLA_HOURS_BY_PRIORITY.HIGH).toBe(24);
    expect(SLA_HOURS_BY_PRIORITY.CRITICAL).toBe(4);
  });

  it("calculateSlaDueAt adds the right offset", () => {
    const now = new Date("2026-04-26T10:00:00Z");
    const due = calculateSlaDueAt("HIGH", now);
    expect(due.toISOString()).toBe("2026-04-27T10:00:00.000Z");
  });

  it("classifies SLA status correctly", () => {
    const now = new Date("2026-04-26T10:00:00Z");
    expect(getSlaStatus(new Date("2026-04-26T09:00:00Z"), now)).toBe("BREACHED");
    expect(getSlaStatus(new Date("2026-04-26T12:00:00Z"), now)).toBe("AT_RISK");
    expect(getSlaStatus(new Date("2026-04-27T20:00:00Z"), now)).toBe("ON_TRACK");
  });
});
