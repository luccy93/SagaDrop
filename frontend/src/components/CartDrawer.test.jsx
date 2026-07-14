jest.mock("@/context/StoreContext", () => ({ useStore: () => mockUseStore() }));
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { email: "test@example.com", name: "Test" } }),
}));
jest.mock("@/lib/api", () => ({
  http: { post: jest.fn() },
  validateCoupon: jest.fn(),
  claimCoupon: jest.fn(),
}));
jest.mock("sonner");
jest.mock("lucide-react");
jest.mock("framer-motion");

import { render, screen, fireEvent } from "@testing-library/react";
import CartDrawer from "./CartDrawer";

const mockUseStore = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseStore.mockReturnValue({
    cart: [],
    totals: { subtotal: 0, items: 0 },
    removeFromCart: jest.fn(),
    updateQty: jest.fn(),
    clearCart: jest.fn(),
    cartOpen: true,
    setCartOpen: jest.fn(),
  });
});

describe("CartDrawer", () => {
  it("renders when cart is open", () => {
    render(<CartDrawer />);
    expect(screen.getByText("Your Cart")).toBeInTheDocument();
    expect(screen.getByText("Your cart is quiet. Add a story.")).toBeInTheDocument();
  });

  it("renders close button", () => {
    render(<CartDrawer />);
    expect(screen.getByTestId("close-cart-btn")).toBeInTheDocument();
  });

  it("shows checkout buttons when cart has items", () => {
    mockUseStore.mockReturnValue({
      cart: [{ id: "b1", title: "Test Book", author: "Author", price: 500, qty: 1, cover: "https://example.com/cover.jpg" }],
      totals: { subtotal: 500, items: 1 },
      removeFromCart: jest.fn(), updateQty: jest.fn(), clearCart: jest.fn(),
      cartOpen: true, setCartOpen: jest.fn(),
    });
    render(<CartDrawer />);
    expect(screen.getByText(/Pay with Card/)).toBeInTheDocument();
    expect(screen.getByText(/Pay with UPI/)).toBeInTheDocument();
  });

  it("shows cart item details", () => {
    mockUseStore.mockReturnValue({
      cart: [{ id: "b1", title: "Test Book", author: "Author", price: 500, qty: 2, cover: "https://example.com/cover.jpg" }],
      totals: { subtotal: 1000, items: 1 },
      removeFromCart: jest.fn(), updateQty: jest.fn(), clearCart: jest.fn(),
      cartOpen: true, setCartOpen: jest.fn(),
    });
    render(<CartDrawer />);
    expect(screen.getByText("Test Book")).toBeInTheDocument();
    expect(screen.getByText("Author")).toBeInTheDocument();
  });

  it("toggles shipping address form", () => {
    mockUseStore.mockReturnValue({
      cart: [{ id: "b1", title: "Test Book", author: "Author", price: 500, qty: 1, cover: "https://example.com/cover.jpg" }],
      totals: { subtotal: 500, items: 1 },
      removeFromCart: jest.fn(), updateQty: jest.fn(), clearCart: jest.fn(),
      cartOpen: true, setCartOpen: jest.fn(),
    });
    render(<CartDrawer />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Coupon code")).toBeInTheDocument();
  });

  it("shows coupon code input", () => {
    mockUseStore.mockReturnValue({
      cart: [{ id: "b1", title: "Test Book", author: "Author", price: 500, qty: 1, cover: "https://example.com/cover.jpg" }],
      totals: { subtotal: 500, items: 1 },
      removeFromCart: jest.fn(), updateQty: jest.fn(), clearCart: jest.fn(),
      cartOpen: true, setCartOpen: jest.fn(),
    });
    render(<CartDrawer />);
    expect(screen.getByPlaceholderText("Coupon code")).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
  });
});
