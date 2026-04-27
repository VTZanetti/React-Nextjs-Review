import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SlaIndicator } from "./sla-indicator";

describe("SlaIndicator", () => {
  it("shows breached label for past due dates", () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    render(<SlaIndicator slaDueAt={past} />);
    expect(screen.getByText(/SLA vencido/i)).toBeInTheDocument();
  });

  it("shows on-track label for far-future dates", () => {
    const future = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    render(<SlaIndicator slaDueAt={future} />);
    expect(screen.getByText(/Dentro do prazo/i)).toBeInTheDocument();
  });
});
