jest.mock("./AdminLayout");
jest.mock("@/lib/api", () => ({
  fetchTrending: () => Promise.resolve([]),
  http: { get: () => Promise.resolve({ data: {} }) },
}));
jest.mock("react-router-dom", () => ({ Link: "a" }));
jest.mock("framer-motion", () => {
  const React = require("react");
  return { motion: new Proxy({}, { get: () => (props) => React.createElement("div", props) }) };
});
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";

describe("AdminDashboard", () => {
  it("renders heading", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders stat cards", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Books in Catalog")).toBeInTheDocument();
    expect(screen.getByText("Avg. Rating")).toBeInTheDocument();
  });

  it("renders quick links", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Manage Books")).toBeInTheDocument();
    expect(screen.getByText("View Orders")).toBeInTheDocument();
  });

  it("renders top books heading", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Top Books")).toBeInTheDocument();
  });
});
