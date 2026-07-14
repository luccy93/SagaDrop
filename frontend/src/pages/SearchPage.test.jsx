const mockSearchBooks = jest.fn();
const mockUseSearchParams = jest.fn(() => [new URLSearchParams(""), jest.fn()]);

jest.mock("react-router-dom", () => ({ Link: "a", useSearchParams: () => mockUseSearchParams() }));
jest.mock("@/lib/api", () => ({ searchBooks: (...args) => mockSearchBooks(...args) }));
jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/components/BookCard", () => "div");
jest.mock("lucide-react");
jest.mock("framer-motion");

import { render, screen, waitFor } from "@testing-library/react";
import SearchPage from "./SearchPage";

beforeEach(() => {
  mockSearchBooks.mockReset();
  mockUseSearchParams.mockReset();
});

describe("SearchPage", () => {
  it("shows empty state when no query", () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams(""), jest.fn()]);
    render(<SearchPage />);
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Enter a keyword to find books.")).toBeInTheDocument();
  });

  it("shows loading state while fetching", () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams("q=test"), jest.fn()]);
    mockSearchBooks.mockReturnValue(new Promise(() => {}));
    render(<SearchPage />);
    expect(screen.getByText(/Searching/)).toBeInTheDocument();
  });

  it("renders book cards when results returned", async () => {
    const books = [
      { id: "b1", title: "Book One", author: "Author A", price: 500, rating: 4.5, reviews: 100, cover: "/1.jpg", category: "Fantasy" },
      { id: "b2", title: "Book Two", author: "Author B", price: 600, rating: 4, reviews: 50, cover: "/2.jpg", category: "Sci-Fi" },
    ];
    mockUseSearchParams.mockReturnValue([new URLSearchParams("q=book"), jest.fn()]);
    mockSearchBooks.mockResolvedValue(books);
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByText(/2 results? found/)).toBeInTheDocument();
    });
  });

  it("shows no results message when search returns empty", async () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams("q=nonexistent"), jest.fn()]);
    mockSearchBooks.mockResolvedValue([]);
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByText(/No books found/)).toBeInTheDocument();
    });
  });

  it("shows result count", async () => {
    const books = Array.from({ length: 3 }, (_, i) => ({
      id: `b${i}`, title: `Book ${i}`, author: `Author ${i}`,
      price: 100, rating: 4, reviews: 10, cover: "", category: "Fantasy",
    }));
    mockUseSearchParams.mockReturnValue([new URLSearchParams("q=test"), jest.fn()]);
    mockSearchBooks.mockResolvedValue(books);
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByText(/3 results? found/)).toBeInTheDocument();
    });
  });
});
