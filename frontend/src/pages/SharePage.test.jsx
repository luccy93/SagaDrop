const mockFetchShare = jest.fn();
const mockUseParams = jest.fn(() => ({ id: "share_abc" }));

jest.mock("@/lib/api", () => ({ fetchShare: (...args) => mockFetchShare(...args) }));
jest.mock("framer-motion");
jest.mock("lucide-react");
jest.mock("sonner");
jest.mock("react-router-dom", () => ({
  Link: "a",
  useParams: () => mockUseParams(),
}));

import { render, screen, waitFor } from "@testing-library/react";
import SharePage from "./SharePage";

beforeEach(() => {
  mockFetchShare.mockReset();
  mockUseParams.mockReset();
});

describe("SharePage", () => {
  it("shows loading state initially", () => {
    mockUseParams.mockReturnValue({ id: "share_abc" });
    mockFetchShare.mockReturnValue(new Promise(() => {}));
    render(<SharePage />);
    expect(screen.getByTestId("share-page")).toBeInTheDocument();
    expect(screen.getByTestId("share-loading")).toBeInTheDocument();
  });

  it("shows 404 page when share not found", async () => {
    mockUseParams.mockReturnValue({ id: "share_abc" });
    const err = new Error("Not Found");
    err.response = { status: 404 };
    mockFetchShare.mockRejectedValue(err);
    render(<SharePage />);
    await waitFor(() => {
      expect(screen.getByTestId("share-not-found")).toBeInTheDocument();
    });
  });

  it("shows network error when fetch fails", async () => {
    mockUseParams.mockReturnValue({ id: "share_abc" });
    mockFetchShare.mockRejectedValue(new Error("Network error"));
    render(<SharePage />);
    await waitFor(() => {
      expect(screen.getByTestId("share-error")).toBeInTheDocument();
    });
  });

  it("renders share content when loaded", async () => {
    mockUseParams.mockReturnValue({ id: "share_abc" });
    mockFetchShare.mockResolvedValue({
      id: "share_abc", title: "My Custom Edition", author: "Test Author",
      cover_url: "https://example.com/cover.jpg",
      material: "Leather", foil: "Gold", size: "Royal Octavo",
      finish: "Matte", edge_stain: "none", views: 42,
      created_at: "2026-06-01T00:00:00Z",
    });
    render(<SharePage />);
    await waitFor(() => {
      expect(screen.getByTestId("share-page-title")).toBeInTheDocument();
    });
    expect(screen.getByText("My Custom Edition")).toBeInTheDocument();
    expect(screen.getByText(/Test Author/)).toBeInTheDocument();
    expect(screen.getAllByText("Leather").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/foil/).length).toBeGreaterThan(0);
    expect(screen.getByText("Design Your Own")).toBeInTheDocument();
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
  });
});
