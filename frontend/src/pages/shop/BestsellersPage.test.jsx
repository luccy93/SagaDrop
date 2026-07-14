jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/components/BookCard", () => "div");
jest.mock("@/lib/api", () => ({ fetchTrending: () => Promise.resolve([]) }));
jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import BestsellersPage from "./BestsellersPage";

describe("BestsellersPage", () => {
  it("renders heading", () => {
    render(<BestsellersPage />);
    expect(screen.getByText(/Sellers/)).toBeInTheDocument();
  });

  it("shows loading skeleton initially", () => {
    render(<BestsellersPage />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(10);
  });
});
