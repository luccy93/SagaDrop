jest.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/lib/api", () => ({
  fetchTrending: () => Promise.resolve([]),
  fetchReviews: () => Promise.resolve([]),
  createReview: () => Promise.resolve({}),
}));
jest.mock("react-router-dom", () => ({ Link: "a" }));
jest.mock("framer-motion", () => {
  const React = require("react");
  const MockEl = (tag) => (props) => {
    const safe = {};
    for (const k of Object.keys(props)) {
      if (["children", "className", "style", "key"].includes(k) || k.startsWith("data-") || k.startsWith("aria-")) {
        safe[k] = props[k];
      }
    }
    return React.createElement(tag, safe);
  };
  return { motion: new Proxy({}, { get: (_, tag) => MockEl(tag) }) };
});
jest.mock("lucide-react");
jest.mock("sonner");

import { render, screen } from "@testing-library/react";
import ReviewsPage from "./ReviewsPage";

describe("ReviewsPage", () => {
  it("renders heading", () => {
    render(<ReviewsPage />);
    expect(screen.getByText(/Reader Stories/)).toBeInTheDocument();
  });

  it("shows sign in link when not logged in", () => {
    render(<ReviewsPage />);
    expect(screen.getByText(/Sign in/)).toBeInTheDocument();
  });

  it("shows static reviews", () => {
    render(<ReviewsPage />);
    expect(screen.getByText("Aanya Mehta")).toBeInTheDocument();
    expect(screen.getByText("Rohan Verma")).toBeInTheDocument();
  });

  it("shows review text", () => {
    render(<ReviewsPage />);
    expect(screen.getByText(/Madeline Miller writes/)).toBeInTheDocument();
    expect(screen.getByText(/Pure nostalgia/)).toBeInTheDocument();
  });
});
