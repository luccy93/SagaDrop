jest.mock("@/lib/api");
jest.mock("./AdminLayout");
jest.mock("sonner");
jest.mock("lucide-react");
jest.mock("framer-motion");

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminBooks from "./AdminBooks";

const mockApi = require("@/lib/api");
const MOCK_BOOKS = [
  { id: "b1", title: "Ready Player One", author: "Ernest Cline", category: "Sci-Fi", collection: "Editor's Picks", price: 549, rating: 4.7, reviews: 42600, cover: "/1.jpg", badge: "Best Seller", year: 2011 },
  { id: "b2", title: "A Court of Mist and Fury", author: "Sarah J. Maas", category: "Romance", collection: "New Releases", price: 799, rating: 4.9, reviews: 21700, cover: "/2.jpg", badge: "Trending", year: 2016 },
  { id: "b3", title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fantasy", collection: "Collector Editions", price: 699, rating: 4.9, reviews: 45300, cover: "/3.jpg", badge: "Classic", year: 1937 },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockApi.fetchTrending.mockResolvedValue(MOCK_BOOKS.slice(0, 3));
  mockApi.fetchBooks.mockImplementation(({ collection }) => {
    const map = {
      "New Releases": [MOCK_BOOKS[1]],
      "Award Winners": [MOCK_BOOKS[0]],
      "Editor's Picks": [MOCK_BOOKS[0]],
      "Collector Editions": [MOCK_BOOKS[2]],
    };
    return Promise.resolve(map[collection] || []);
  });
});

describe("AdminBooks", () => {
  it("shows loading skeleton initially", () => {
    render(<AdminBooks />);
    expect(screen.getByText(/titles in catalog/)).toBeInTheDocument();
  });

  it("shows books table after load", async () => {
    render(<AdminBooks />);
    await waitFor(() => {
      expect(screen.getByText("Ready Player One")).toBeInTheDocument();
    });
    expect(screen.getByText("The Hobbit")).toBeInTheDocument();
  });

  it("opens add modal with Cancel button", async () => {
    render(<AdminBooks />);
    await waitFor(() => screen.getByText("Ready Player One"));
    fireEvent.click(screen.getByText("Add Book"));
    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });

  it("opens edit modal with pre-filled title input", async () => {
    render(<AdminBooks />);
    await waitFor(() => screen.getByText("Ready Player One"));
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    await waitFor(() => {
      expect(screen.getByDisplayValue("Ready Player One")).toBeInTheDocument();
    });
  });

  it("shows empty state when no books match search", async () => {
    render(<AdminBooks />);
    await waitFor(() => screen.getByText("Ready Player One"));
    fireEvent.change(screen.getByPlaceholderText("Search title or author…"), { target: { value: "zzznonexistent" } });
    await waitFor(() => {
      expect(screen.getByText("No books match your search.")).toBeInTheDocument();
    });
  });

  it("filters by category", async () => {
    render(<AdminBooks />);
    await waitFor(() => screen.getByText("Ready Player One"));
    const catButtons = screen.getAllByText("Fantasy");
    fireEvent.click(catButtons[0]);
    await waitFor(() => {
      expect(screen.getByText("The Hobbit")).toBeInTheDocument();
    });
  });
});
