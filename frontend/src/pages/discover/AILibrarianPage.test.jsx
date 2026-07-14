jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/components/BookCard", () => "div");
jest.mock("@/lib/api", () => ({ aiRecommend: () => Promise.resolve([]) }));
jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy({}, { get: () => (props) => React.createElement("div", props) }),
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, {}, children),
  };
});
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import AILibrarianPage from "./AILibrarianPage";

describe("AILibrarianPage", () => {
  it("renders heading", () => {
    render(<AILibrarianPage />);
    expect(screen.getByText(/AI Librarian/)).toBeInTheDocument();
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
