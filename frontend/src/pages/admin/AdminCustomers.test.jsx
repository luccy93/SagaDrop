jest.mock("./AdminLayout");
jest.mock("@/lib/api", () => ({ fetchCustomers: () => Promise.resolve([]) }));
jest.mock("framer-motion", () => {
  const React = require("react");
  return { motion: new Proxy({}, { get: () => (props) => React.createElement("div", props) }) };
});
jest.mock("lucide-react");

import { render, screen, waitFor } from "@testing-library/react";
import AdminCustomers from "./AdminCustomers";

describe("AdminCustomers", () => {
  it("renders heading", () => {
    render(<AdminCustomers />);
    expect(screen.getByText("Customers")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    render(<AdminCustomers />);
    await waitFor(() => {
      expect(screen.getByText("No users found.")).toBeInTheDocument();
    });
  });

  it("renders search input", () => {
    render(<AdminCustomers />);
    expect(screen.getByPlaceholderText("Search name or email…")).toBeInTheDocument();
  });
});
