jest.mock("./AdminLayout");
jest.mock("framer-motion", () => {
  const React = require("react");
  return { motion: new Proxy({}, { get: () => (props) => React.createElement("div", props) }) };
});
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import AdminComingSoon from "./AdminComingSoon";

describe("AdminComingSoon", () => {
  it("renders default title", () => {
    render(<AdminComingSoon />);
    expect(screen.getAllByText("Coming Soon").length).toBeGreaterThan(0);
  });

  it("renders custom title", () => {
    render(<AdminComingSoon title="Settings" />);
    expect(screen.getAllByText("Settings").length).toBeGreaterThan(0);
  });

  it("shows under construction message", () => {
    render(<AdminComingSoon />);
    expect(screen.getByText(/under construction/)).toBeInTheDocument();
  });
});
