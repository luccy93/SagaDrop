jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");
jest.mock("lucide-react");

import { render, screen, fireEvent } from "@testing-library/react";
import FAQPage from "./FAQPage";

describe("FAQPage", () => {
  it("renders heading", () => {
    render(<FAQPage />);
    expect(screen.getByText(/Frequently/)).toBeInTheDocument();
    expect(screen.getByText(/Asked/)).toBeInTheDocument();
  });

  it("renders all FAQ questions", () => {
    render(<FAQPage />);
    expect(screen.getByText("How long does delivery take?")).toBeInTheDocument();
    expect(screen.getByText("Can I return a book?")).toBeInTheDocument();
    expect(screen.getByText("How does the Book Advisor work?")).toBeInTheDocument();
    expect(screen.getByText("What payment methods do you accept?")).toBeInTheDocument();
  });

  it("toggles answer on click", () => {
    render(<FAQPage />);
    const q = screen.getByText("How long does delivery take?");
    fireEvent.click(q);
    expect(screen.getByText(/Standard delivery takes/)).toBeInTheDocument();
  });
});
