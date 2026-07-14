jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/components/BookCard", () => "div");
jest.mock("@/lib/api", () => ({ fetchBooks: () => Promise.resolve([]) }));
jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import CollectorEditionsPage from "./CollectorEditionsPage";

describe("CollectorEditionsPage", () => {
  it("renders heading", () => {
    render(<CollectorEditionsPage />);
    expect(screen.getByText(/Slipcased/)).toBeInTheDocument();
  });

  it("shows loading skeleton initially", () => {
    render(<CollectorEditionsPage />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(10);
  });

  it("shows empty state when no books", async () => {
    render(<CollectorEditionsPage />);
    const empty = await screen.findByText(/No collector editions available/);
    expect(empty).toBeInTheDocument();
  });
});
