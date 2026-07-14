jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/components/BookCard", () => "div");
jest.mock("@/lib/api", () => ({ fetchBooks: () => Promise.resolve([]) }));
jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import NewReleasesPage from "./NewReleasesPage";

describe("NewReleasesPage", () => {
  it("renders heading", () => {
    render(<NewReleasesPage />);
    expect(screen.getByText(/Fresh off the press/)).toBeInTheDocument();
  });

  it("shows loading skeleton initially", () => {
    render(<NewReleasesPage />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(10);
  });
});
