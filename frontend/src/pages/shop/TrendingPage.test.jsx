jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/components/BookCard", () => "div");
jest.mock("@/lib/api", () => ({ fetchTrending: () => Promise.resolve([]) }));
jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import TrendingPage from "./TrendingPage";

describe("TrendingPage", () => {
  it("renders heading", () => {
    render(<TrendingPage />);
    expect(screen.getByText(/What the world is reading right now/)).toBeInTheDocument();
  });

  it("shows loading skeleton initially", () => {
    render(<TrendingPage />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(10);
  });
});
