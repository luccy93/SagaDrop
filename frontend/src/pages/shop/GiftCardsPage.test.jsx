jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");
jest.mock("lucide-react");
jest.mock("sonner");

import { render, screen, fireEvent } from "@testing-library/react";
import GiftCardsPage from "./GiftCardsPage";

describe("GiftCardsPage", () => {
  it("renders heading and description", () => {
    render(<GiftCardsPage />);
    expect(screen.getByText(/Gift Cards/)).toBeInTheDocument();
  });

  it("renders amount buttons", () => {
    render(<GiftCardsPage />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders form labels", () => {
    render(<GiftCardsPage />);
    expect(screen.getByText("Choose Amount")).toBeInTheDocument();
    expect(screen.getByText("Recipient Email")).toBeInTheDocument();
    expect(screen.getByText("Personal Message (optional)")).toBeInTheDocument();
  });

  it("renders add to cart button", () => {
    render(<GiftCardsPage />);
    expect(screen.getByText(/Add to Cart/)).toBeInTheDocument();
  });

  it("custom amount input works", () => {
    render(<GiftCardsPage />);
    const input = screen.getByPlaceholderText("Custom");
    fireEvent.change(input, { target: { value: "750" } });
    expect(screen.getByText(/Add to Cart/)).toBeInTheDocument();
  });
});
