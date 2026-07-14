jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");
jest.mock("lucide-react");
jest.mock("sonner");

import { render, screen, fireEvent } from "@testing-library/react";
import ContactPage from "./ContactPage";

describe("ContactPage", () => {
  it("renders heading", () => {
    render(<ContactPage />);
    expect(screen.getByText(/Get in/)).toBeInTheDocument();
    expect(screen.getByText(/Touch/)).toBeInTheDocument();
  });

  it("renders contact info", () => {
    render(<ContactPage />);
    expect(screen.getByText(/hello@sagadrop.com/)).toBeInTheDocument();
    expect(screen.getByText(/12 Literary Lane/)).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(<ContactPage />);
    expect(screen.getByText("Send Message")).toBeInTheDocument();
    expect(screen.getByText("Your Name")).toBeInTheDocument();
    expect(screen.getByText("Email Address")).toBeInTheDocument();
  });

  it("shows success message after submit", () => {
    render(<ContactPage />);
    fireEvent.click(screen.getByText("Send Message"));
    expect(screen.getByText("Message received.")).toBeInTheDocument();
  });
});
