const mockUpdateProfile = jest.fn();
const mockChangePassword = jest.fn();
const mockLogout = jest.fn();
const mockRefreshUser = jest.fn();
const mockUseNavigate = jest.fn();

jest.mock("@/lib/api", () => ({
  updateProfile: (...args) => mockUpdateProfile(...args),
  changePassword: (...args) => mockChangePassword(...args),
}));
jest.mock("@/components/PageLayout", () => "div");
jest.mock("@/context/AuthContext", () => ({ useAuth: () => mockUseAuth() }));
jest.mock("framer-motion");
jest.mock("lucide-react");
jest.mock("react-router-dom", () => {
  const r = require("react");
  return {
    Link: ({ children, to, className, ...props }) =>
      r.createElement("a", { href: to, className, ...props }, children),
    useNavigate: () => mockUseNavigate,
  };
});
jest.mock("sonner");

import { render, screen, fireEvent } from "@testing-library/react";
import AccountPage from "./AccountPage";

const mockUseAuth = jest.fn(() => ({
  user: { email: "user@test.com", name: "Test User" },
  logout: mockLogout,
  refreshUser: mockRefreshUser,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: { email: "user@test.com", name: "Test User" },
    logout: mockLogout,
    refreshUser: mockRefreshUser,
  });
});

describe("AccountPage", () => {
  it("shows settings title when logged in", () => {
    render(<AccountPage />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("● Account")).toBeInTheDocument();
  });

  it("shows login prompt when no user", () => {
    mockUseAuth.mockReturnValue({ user: null, logout: jest.fn(), refreshUser: jest.fn() });
    render(<AccountPage />);
    expect(screen.getByText(/log in/)).toBeInTheDocument();
  });

  it("renders profile section with user email", () => {
    render(<AccountPage />);
    const emailInputs = screen.getAllByDisplayValue("user@test.com");
    expect(emailInputs.length).toBeGreaterThan(0);
  });

  it("shows My Orders link", () => {
    render(<AccountPage />);
    expect(screen.getByText("My Orders")).toBeInTheDocument();
  });

  it("shows Log Out button", () => {
    render(<AccountPage />);
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("shows password change form", () => {
    render(<AccountPage />);
    expect(screen.getByText("Change Password")).toBeInTheDocument();
  });
});
