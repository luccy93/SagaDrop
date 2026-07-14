jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion");
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import ShippingPage from "./ShippingPage";

describe("ShippingPage", () => {
  it("renders heading", () => {
    render(<ShippingPage />);
    expect(screen.getAllByText(/Shipping/).length).toBeGreaterThan(0);
    expect(screen.getByText(/& Delivery/)).toBeInTheDocument();
  });

  it("renders shipping features", () => {
    render(<ShippingPage />);
    expect(screen.getByText("Fast Dispatch")).toBeInTheDocument();
    expect(screen.getByText("Ships Worldwide")).toBeInTheDocument();
    expect(screen.getByText("Real-Time Updates")).toBeInTheDocument();
    expect(screen.getByText("Safe Packaging")).toBeInTheDocument();
  });

  it("renders delivery zones", () => {
    render(<ShippingPage />);
    expect(screen.getByText("Delivery Zones")).toBeInTheDocument();
    expect(screen.getByText("Metro Cities")).toBeInTheDocument();
    expect(screen.getByText("International")).toBeInTheDocument();
  });

  it("renders zone details", () => {
    render(<ShippingPage />);
    expect(screen.getAllByText(/Free above/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Calculated at checkout/)).toBeInTheDocument();
  });
});
