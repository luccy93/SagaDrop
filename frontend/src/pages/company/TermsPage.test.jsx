jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import TermsPage from "./TermsPage";

describe("TermsPage", () => {
  it("renders hero heading", () => {
    render(<TermsPage />);
    const headings = screen.getAllByText(/Terms of/);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("renders effective date", () => {
    render(<TermsPage />);
    expect(screen.getByText(/Effective date:/)).toBeInTheDocument();
  });

  it("renders all sections", () => {
    render(<TermsPage />);
    expect(screen.getByText("1. Acceptance of Terms")).toBeInTheDocument();
    expect(screen.getByText("10. Changes to Terms")).toBeInTheDocument();
  });

  it("renders section body text", () => {
    render(<TermsPage />);
    expect(screen.getByText(/governed by the laws of India/)).toBeInTheDocument();
  });
});
