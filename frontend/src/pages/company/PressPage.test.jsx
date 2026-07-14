jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import PressPage from "./PressPage";

describe("PressPage", () => {
  it("renders hero heading", () => {
    render(<PressPage />);
    expect(screen.getByText(/In the/)).toBeInTheDocument();
    expect(screen.getByText(/News/)).toBeInTheDocument();
  });

  it("renders press kit section", () => {
    render(<PressPage />);
    expect(screen.getByText("Press Kit")).toBeInTheDocument();
    expect(screen.getByText(/Download Press Kit/)).toBeInTheDocument();
  });

  it("renders press contact", () => {
    render(<PressPage />);
    expect(screen.getByText("Press Contact")).toBeInTheDocument();
    expect(screen.getByText(/press@sagadrop.com/)).toBeInTheDocument();
  });

  it("renders press mentions", () => {
    render(<PressPage />);
    expect(screen.getByText("The Hindu")).toBeInTheDocument();
    expect(screen.getByText("Forbes India")).toBeInTheDocument();
    expect(screen.getByText("Mint")).toBeInTheDocument();
  });
});
