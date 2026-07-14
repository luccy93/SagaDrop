jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");
jest.mock("lucide-react");
jest.mock("react-router-dom", () => ({ Link: "a" }));

import { render, screen } from "@testing-library/react";
import CareersPage from "./CareersPage";

describe("CareersPage", () => {
  it("renders hero section", () => {
    render(<CareersPage />);
    expect(screen.getByText(/Build the/)).toBeInTheDocument();
    expect(screen.getByText(/Future of/)).toBeInTheDocument();
    expect(screen.getByText(/Reading/)).toBeInTheDocument();
  });

  it("renders benefits", () => {
    render(<CareersPage />);
    expect(screen.getByText("Remote-first")).toBeInTheDocument();
    expect(screen.getByText("Equity for all")).toBeInTheDocument();
    expect(screen.getByText(/₹5K book budget/)).toBeInTheDocument();
  });

  it("renders open roles", () => {
    render(<CareersPage />);
    expect(screen.getByText("Senior Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("AI / ML Engineer")).toBeInTheDocument();
    expect(screen.getByText("Editorial Curator")).toBeInTheDocument();
  });

  it("renders call to action", () => {
    render(<CareersPage />);
    expect(screen.getByText("Don't see your role?")).toBeInTheDocument();
    expect(screen.getByText("Say Hello")).toBeInTheDocument();
  });
});
