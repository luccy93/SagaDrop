const mockFetchMyOrders = jest.fn();

jest.mock("@/lib/api", () => ({ fetchMyOrders: (...args) => mockFetchMyOrders(...args) }));
jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/context/AuthContext", () => ({ useAuth: () => mockUseAuth() }));
jest.mock("framer-motion");
jest.mock("lucide-react");

import { render, screen, waitFor } from "@testing-library/react";
import MyOrdersPage from "./MyOrdersPage";

const mockUseAuth = jest.fn(() => ({ user: { email: "test@example.com" } }));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { email: "test@example.com" } });
  mockFetchMyOrders.mockReset();
});

describe("MyOrdersPage", () => {
  it("shows title and account label", () => {
    mockFetchMyOrders.mockResolvedValue([]);
    render(<MyOrdersPage />);
    expect(screen.getByText("My Orders")).toBeInTheDocument();
    expect(screen.getByText("● Account")).toBeInTheDocument();
  });

  it("shows login prompt when no user", () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<MyOrdersPage />);
    expect(screen.getByText(/log in/)).toBeInTheDocument();
  });

  it("shows loading skeleton while fetching", () => {
    mockFetchMyOrders.mockReturnValue(new Promise(() => {}));
    render(<MyOrdersPage />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(3);
  });

  it("shows empty state when no orders", async () => {
    mockFetchMyOrders.mockResolvedValue([]);
    render(<MyOrdersPage />);
    await waitFor(() => {
      expect(screen.getByText("No orders yet.")).toBeInTheDocument();
    });
  });

  it("renders orders list", async () => {
    const orders = [
      {
        id: "ord_abc123xyz", status: "shipped", created_at: "2026-06-15T10:00:00Z",
        provider: "Razorpay", payment_id: "pay_test_001",
        total: 999, shipping_address: { line1: "123 Main St", city: "Mumbai", state: "MH", pincode: "400001" },
        items: [{ cover: "", title: "Test Book", author: "Author", qty: 1, price: 999 }],
      },
    ];
    mockFetchMyOrders.mockResolvedValue(orders);
    render(<MyOrdersPage />);
    await waitFor(() => {
      expect(screen.getByText("Test Book")).toBeInTheDocument();
    });
    expect(screen.getByText("Shipped")).toBeInTheDocument();
    expect(screen.getByText("15 Jun 2026")).toBeInTheDocument();
    expect(screen.getByText(/Razorpay/)).toBeInTheDocument();
  });
});
