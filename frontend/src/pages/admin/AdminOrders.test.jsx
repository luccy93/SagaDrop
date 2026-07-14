jest.mock("./AdminLayout");
jest.mock("@/lib/api", () => ({ http: { get: () => Promise.resolve({ data: [] }) } }));
jest.mock("framer-motion", () => {
  const React = require("react");
  return { motion: new Proxy({}, { get: () => (props) => React.createElement("div", props) }) };
});
jest.mock("lucide-react");
jest.mock("sonner");

import { render, screen, waitFor } from "@testing-library/react";
import AdminOrders from "./AdminOrders";

describe("AdminOrders", () => {
  it("renders heading", () => {
    render(<AdminOrders />);
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    render(<AdminOrders />);
    await waitFor(() => {
      expect(screen.getByText("No orders found.")).toBeInTheDocument();
    });
  });

  it("renders search input", () => {
    render(<AdminOrders />);
    expect(screen.getByPlaceholderText("Search order ID or email…")).toBeInTheDocument();
  });
});
