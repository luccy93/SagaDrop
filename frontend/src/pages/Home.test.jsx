jest.mock("@/components/Navbar", () => "div");
jest.mock("@/components/Hero3D", () => "div");
jest.mock("@/components/Marquee", () => "div");
jest.mock("@/components/TrendingBooks", () => "div");
jest.mock("@/components/Categories", () => "div");
jest.mock("@/components/AIRecommendationStudio", () => "div");
jest.mock("@/components/BookCustomizer", () => "div");
jest.mock("@/components/Collections", () => "div");
jest.mock("@/components/Authors", () => "div");
jest.mock("@/components/Newsletter", () => "div");
jest.mock("@/components/Footer", () => "div");
jest.mock("@/components/CartDrawer", () => "div");
jest.mock("@/components/WishlistDrawer", () => "div");

import { render, screen } from "@testing-library/react";
import Home from "./Home";

describe("HomePage", () => {
  it("renders the home page layout", () => {
    render(<Home />);
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  it("renders all sections", () => {
    render(<Home />);
    const main = screen.getByTestId("home-page");
    expect(main).toBeInTheDocument();
  });
});
