jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import AboutPage from "./AboutPage";

describe("AboutPage", () => {
  it("renders hero title", () => {
    render(<AboutPage />);
    expect(screen.getByText(/Every Story/)).toBeInTheDocument();
    expect(screen.getByText(/Begins Here/)).toBeInTheDocument();
  });

  it("renders stats section", () => {
    render(<AboutPage />);
    expect(screen.getByText("40,000+")).toBeInTheDocument();
    expect(screen.getByText("Books in Catalog")).toBeInTheDocument();
    expect(screen.getByText("4.9★")).toBeInTheDocument();
  });

  it("renders team section", () => {
    render(<AboutPage />);
    expect(screen.getByText("Aryan Kapoor")).toBeInTheDocument();
    expect(screen.getByText("Founder & CEO")).toBeInTheDocument();
    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
  });

  it("renders our story section", () => {
    render(<AboutPage />);
    expect(screen.getByText("Our Story")).toBeInTheDocument();
    expect(screen.getByText(/We believe books are heirlooms/)).toBeInTheDocument();
  });
});
