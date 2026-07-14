jest.mock("react-router-dom", () => {
  const r = require("react");
  return {
    Link: ({ children, to, className, ...props }) =>
      r.createElement("a", { href: to, className, ...props }, children),
  };
});
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import CheckoutCancel from "./CheckoutCancel";

describe("CheckoutCancel", () => {
  it("shows payment cancelled message", () => {
    render(<CheckoutCancel />);
    expect(screen.getByText("Payment Cancelled")).toBeInTheDocument();
  });

  it("shows reassuring message", () => {
    render(<CheckoutCancel />);
    expect(screen.getByText(/No worries/)).toBeInTheDocument();
  });

  it("shows back to store link", () => {
    render(<CheckoutCancel />);
    expect(screen.getByText("Back to Store")).toBeInTheDocument();
  });
});
