jest.mock("@/components/PageLayout", () => "div");
jest.mock("framer-motion", () => {
  const React = require("react");
  const MockDiv = (props) => {
    const safe = {};
    for (const k of Object.keys(props)) {
      if (["children", "className", "style", "key", "id", "href", "target", "rel", "src", "alt", "onClick", "onChange", "onSubmit", "onKeyDown", "onBlur", "onFocus", "loading"].includes(k) || k.startsWith("data-") || k.startsWith("aria-")) {
        safe[k] = props[k];
      }
    }
    return React.createElement("div", safe);
  };
  return { motion: new Proxy({}, { get: () => MockDiv }) };
});
jest.mock("lucide-react");

import { render, screen } from "@testing-library/react";
import AuthorsPage from "./AuthorsPage";

describe("AuthorsPage", () => {
  it("renders heading", () => {
    render(<AuthorsPage />);
    expect(screen.getByText(/The/)).toBeInTheDocument();
    expect(screen.getByText(/Voices/)).toBeInTheDocument();
  });

  it("renders all authors", () => {
    render(<AuthorsPage />);
    expect(screen.getByText("Colleen Hoover")).toBeInTheDocument();
    expect(screen.getByText("Brandon Sanderson")).toBeInTheDocument();
    expect(screen.getByText("Stephen King")).toBeInTheDocument();
    expect(screen.getAllByText("books").length).toBeGreaterThan(0);
  });

  it("shows genre for each author", () => {
    render(<AuthorsPage />);
    expect(screen.getByText("Fantasy · Epic")).toBeInTheDocument();
    expect(screen.getByText("Horror · Thriller")).toBeInTheDocument();
  });
});
