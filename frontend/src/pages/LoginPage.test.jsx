const mockUseNavigate = jest.fn();
const mockLogin = jest.fn();
const mockSendOtp = jest.fn();
const mockVerifyOtp = jest.fn();

jest.mock("react-router-dom", () => {
  const r = require("react");
  return {
    Link: ({ children, to, className, ...props }) =>
      r.createElement("a", { href: to, className, ...props }, children),
    useNavigate: () => mockUseNavigate,
  };
});
jest.mock("@/context/AuthContext", () => ({ useAuth: () => mockUseAuth() }));
jest.mock("@/components/AuthLayout", () => "div");
jest.mock("@react-oauth/google", () => ({ GoogleOAuthProvider: "div", useGoogleLogin: () => jest.fn() }));
jest.mock("sonner");
jest.mock("lucide-react");
jest.mock("framer-motion");

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./LoginPage";

const mockUseAuth = jest.fn(() => ({
  login: mockLogin,
  sendOtp: mockSendOtp,
  verifyOtp: mockVerifyOtp,
  loginWithGoogle: jest.fn(),
  googleClientId: "",
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    login: mockLogin,
    sendOtp: mockSendOtp,
    verifyOtp: mockVerifyOtp,
    loginWithGoogle: jest.fn(),
    googleClientId: "",
  });
  mockLogin.mockReset();
  mockSendOtp.mockReset();
  mockVerifyOtp.mockReset();
});

describe("LoginPage", () => {
  it("renders password login form by default", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("toggles to OTP tab", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Email OTP"));
    expect(screen.getByText("Send Code")).toBeInTheDocument();
  });

  it("shows create account link", () => {
    render(<LoginPage />);
    expect(screen.getByText("Create an account")).toBeInTheDocument();
  });

  it("shows forgot password link", () => {
    render(<LoginPage />);
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  it("OTP flow shows step 2 with code input after sending", async () => {
    mockSendOtp.mockResolvedValue({ dev_otp: "123456", sent: false });
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Email OTP"));
    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByText("Send Code"));
    await waitFor(() => {
      expect(screen.getByText("Check Your Email.")).toBeInTheDocument();
    });
  });
});
