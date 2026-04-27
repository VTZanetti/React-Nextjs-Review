import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("renders the human-readable label for a status", () => {
    render(<StatusBadge status="OPEN" />);
    expect(screen.getByText("Aberto")).toBeInTheDocument();
  });

  it("renders the resolved label", () => {
    render(<StatusBadge status="RESOLVED" />);
    expect(screen.getByText("Resolvido")).toBeInTheDocument();
  });
});
