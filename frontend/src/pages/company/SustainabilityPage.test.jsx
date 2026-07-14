jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import SustainabilityPage from "./SustainabilityPage";

describe("SustainabilityPage", () => {
  it("renders hero", () => {
    render(<SustainabilityPage />);
    expect(screen.getByText(/Print/)).toBeInTheDocument();
    expect(screen.getByText(/Responsibly/)).toBeInTheDocument();
  });

  it("renders all four pillars", () => {
    render(<SustainabilityPage />);
    expect(screen.getByText("FSC-certified Paper")).toBeInTheDocument();
    expect(screen.getByText("Recyclable Packaging")).toBeInTheDocument();
    expect(screen.getByText("Carbon-Neutral Shipping")).toBeInTheDocument();
    expect(screen.getByText("1% for Libraries")).toBeInTheDocument();
  });

  it("renders impact stats", () => {
    render(<SustainabilityPage />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText(/CO₂ offset/)).toBeInTheDocument();
    expect(screen.getByText(/donated to public libraries/)).toBeInTheDocument();
  });
});
