jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");
jest.mock("lucide-react");

import { render, screen, fireEvent } from "@testing-library/react";
import TrackOrderPage from "./TrackOrderPage";

describe("TrackOrderPage", () => {
  it("renders heading", () => {
    render(<TrackOrderPage />);
    expect(screen.getByText(/Where's/)).toBeInTheDocument();
    expect(screen.getByText(/My Book/)).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<TrackOrderPage />);
    expect(screen.getByPlaceholderText(/Enter Order ID/)).toBeInTheDocument();
    expect(screen.getByText("Track")).toBeInTheDocument();
  });

  it("shows tracking steps after entering order ID", () => {
    render(<TrackOrderPage />);
    const input = screen.getByPlaceholderText(/Enter Order ID/);
    fireEvent.change(input, { target: { value: "ORD-2026-TEST" } });
    fireEvent.click(screen.getByText("Track"));
    expect(screen.getByText("Order Placed")).toBeInTheDocument();
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("Dispatched")).toBeInTheDocument();
    expect(screen.getByText("In Transit")).toBeInTheDocument();
  });

  it("shows estimated delivery", () => {
    render(<TrackOrderPage />);
    const input = screen.getByPlaceholderText(/Enter Order ID/);
    fireEvent.change(input, { target: { value: "ORD-TEST" } });
    fireEvent.click(screen.getByText("Track"));
    expect(screen.getByText(/Estimated delivery/)).toBeInTheDocument();
  });
});
