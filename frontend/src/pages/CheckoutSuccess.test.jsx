const mockHttpGet = jest.fn();
const mockUseSearchParams = jest.fn(() => [new URLSearchParams("session_id=cs_test_123"), jest.fn()]);

jest.mock("@/lib/api", () => ({ http: { get: (...args) => mockHttpGet(...args) } }));
jest.mock("lucide-react");
jest.mock("react-router-dom", () => ({
  Link: "a",
  useSearchParams: () => mockUseSearchParams(),
}));

import { render, screen, waitFor } from "@testing-library/react";
import CheckoutSuccess from "./CheckoutSuccess";

beforeEach(() => {
  mockHttpGet.mockReset();
  mockUseSearchParams.mockReset();
});

describe("CheckoutSuccess", () => {
  it("shows order confirmed heading", () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams("session_id=cs_test_123"), jest.fn()]);
    mockHttpGet.mockResolvedValue({ data: { customer_email: "test@example.com", items: [], total: 0 } });
    render(<CheckoutSuccess />);
    expect(screen.getByText("Order Confirmed")).toBeInTheDocument();
  });

  it("shows default message when no session_id", () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams(""), jest.fn()]);
    render(<CheckoutSuccess />);
    expect(screen.getByText(/Thank you for your purchase/)).toBeInTheDocument();
  });
});
