jest.mock("./AdminLayout");
jest.mock("@/lib/api", () => ({
  fetchCoupons: () => Promise.resolve([]),
  createCoupon: () => Promise.resolve({}),
  deleteCoupon: () => Promise.resolve({}),
}));
jest.mock("framer-motion", () => {
  const React = require("react");
  const MockDiv = (props) => {
    const safe = {};
    for (const k of Object.keys(props)) {
      if (["children", "className", "style", "key", "onClick"].includes(k) || k.startsWith("data-") || k.startsWith("aria-")) {
        safe[k] = props[k];
      }
    }
    return React.createElement("div", safe);
  };
  return { motion: new Proxy({}, { get: () => MockDiv }), AnimatePresence: ({ children }) => React.createElement(React.Fragment, {}, children) };
});
jest.mock("lucide-react");
jest.mock("sonner");

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminCoupons from "./AdminCoupons";

describe("AdminCoupons", () => {
  it("renders heading", () => {
    render(<AdminCoupons />);
    expect(screen.getByText("Coupons")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    render(<AdminCoupons />);
    await waitFor(() => {
      expect(screen.getByText("No coupons yet.")).toBeInTheDocument();
    });
  });

  it("opens add coupon modal", () => {
    render(<AdminCoupons />);
    fireEvent.click(screen.getByText("New Coupon"));
    expect(screen.getAllByText("New Coupon").length).toBeGreaterThan(0);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
