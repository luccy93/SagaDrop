jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/components/BookCustomizer", () => "div");
jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import BookCustomizerPage from "./BookCustomizerPage";

describe("BookCustomizerPage", () => {
  it("renders heading", () => {
    render(<BookCustomizerPage />);
    expect(screen.getByText(/Design Your/)).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<BookCustomizerPage />);
    expect(screen.getByText(/Choose your cover/)).toBeInTheDocument();
  });
});
