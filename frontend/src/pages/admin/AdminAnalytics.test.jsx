jest.mock("./AdminLayout");
jest.mock("@/lib/api", () => ({ fetchTrending: () => Promise.resolve([]) }));
jest.mock("framer-motion", () => {
  const React = require("react");
  return { motion: new Proxy({}, { get: () => (props) => React.createElement("div", props) }) };
});
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import AdminAnalytics from "./AdminAnalytics";

describe("AdminAnalytics", () => {
  it("renders heading", () => {
    render(<AdminAnalytics />);
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("renders KPI cards", () => {
    render(<AdminAnalytics />);
    expect(screen.getByText("Revenue (Jul)")).toBeInTheDocument();
    expect(screen.getByText("Orders (Jul)")).toBeInTheDocument();
  });

  it("renders monthly revenue chart", () => {
    render(<AdminAnalytics />);
    expect(screen.getByText("Monthly Revenue (₹)")).toBeInTheDocument();
  });
});
