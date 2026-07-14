jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/components/BookCard", () => "div");
jest.mock("@/lib/api", () => ({ getRecommend: () => Promise.resolve([]) }));
jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy({}, { get: () => (props) => React.createElement("div", props) }),
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, {}, children),
  };
});
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import BookAdvisorPage from "./BookAdvisorPage";

describe("BookAdvisorPage", () => {
  it("renders heading", () => {
    render(<BookAdvisorPage />);
    expect(screen.getByText(/Book Advisor/)).toBeInTheDocument();
  });

  it("renders mood chips", () => {
    render(<AILibrarianPage />);
    expect(screen.getByText("Adventurous")).toBeInTheDocument();
    expect(screen.getByText("Thrilling")).toBeInTheDocument();
  });

  it("renders tone chips", () => {
    render(<AILibrarianPage />);
    expect(screen.getByText("Lyrical")).toBeInTheDocument();
    expect(screen.getByText("Conversational")).toBeInTheDocument();
  });

  it("renders textarea", () => {
    render(<AILibrarianPage />);
    expect(screen.getByPlaceholderText(/dark fantasy/)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<AILibrarianPage />);
    expect(screen.getByText("Find My Books")).toBeInTheDocument();
  });
});
