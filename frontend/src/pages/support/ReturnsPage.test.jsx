jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import ReturnsPage from "./ReturnsPage";

describe("ReturnsPage", () => {
  it("renders heading", () => {
    render(<ReturnsPage />);
    expect(screen.getByText(/Returns &/)).toBeInTheDocument();
    expect(screen.getByText(/Exchanges/)).toBeInTheDocument();
  });

  it("renders return policies", () => {
    render(<ReturnsPage />);
    expect(screen.getByText("14-Day Returns")).toBeInTheDocument();
    expect(screen.getByText("Collector Editions")).toBeInTheDocument();
    expect(screen.getByText("Non-Returnable")).toBeInTheDocument();
  });

  it("renders how-to-return steps", () => {
    render(<ReturnsPage />);
    expect(screen.getByText("How to Return")).toBeInTheDocument();
    expect(screen.getByText("Initiate Return")).toBeInTheDocument();
    expect(screen.getByText("Refund Processed")).toBeInTheDocument();
  });

  it("renders refund timeline", () => {
    render(<ReturnsPage />);
    expect(screen.getByText(/Refund Timeline/)).toBeInTheDocument();
  });
});
