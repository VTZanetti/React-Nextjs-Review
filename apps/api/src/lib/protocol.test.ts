import { describe, expect, it } from "vitest";
import { generateTicketProtocol } from "./protocol.js";

describe("generateTicketProtocol", () => {
  it("generates protocol in SD-YYYYMMDD-XXXX format", () => {
    const date = new Date("2026-04-26T12:00:00Z");
    const protocol = generateTicketProtocol(date);
    expect(protocol).toMatch(/^SD-\d{8}-[A-Z0-9]{4}$/);
    expect(protocol.startsWith("SD-")).toBe(true);
  });

  it("produces different protocols on consecutive calls", () => {
    const a = generateTicketProtocol();
    const b = generateTicketProtocol();
    expect(a).not.toEqual(b);
  });
});
