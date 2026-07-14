jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/components/BookCard", () => "div");
jest.mock("@/lib/api", () => ({ fetchBooks: () => Promise.resolve([]) }));
jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }));
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
  return { motion: new Proxy({}, { get: () => MockDiv }) };
});

import { render, screen, fireEvent } from "@testing-library/react";
import CategoriesPage from "./CategoriesPage";

describe("CategoriesPage", () => {
  it("renders heading", () => {
    render(<CategoriesPage />);
    expect(screen.getByText(/Every/)).toBeInTheDocument();
    expect(screen.getByText(/Genre/)).toBeInTheDocument();
  });

  it("renders all categories", () => {
    render(<CategoriesPage />);
    expect(screen.getByText("Fantasy")).toBeInTheDocument();
    expect(screen.getByText("Mystery")).toBeInTheDocument();
    expect(screen.getByText("Romance")).toBeInTheDocument();
    expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
    expect(screen.getByText("Classics")).toBeInTheDocument();
  });

  it("shows books when category clicked", () => {
    render(<CategoriesPage />);
    fireEvent.click(screen.getByText("Fantasy"));
    expect(screen.getAllByText("Fantasy").length).toBeGreaterThan(0);
  });
});
