const mockUseNavigate = jest.fn();
const mockRegister = jest.fn();
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
import SignupPage from "./SignupPage";

const mockUseAuth = jest.fn(() => ({
  register: mockRegister,
  sendOtp: mockSendOtp,
  verifyOtp: mockVerifyOtp,
  loginWithGoogle: jest.fn(),
  googleClientId: "",
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    register: mockRegister,
    sendOtp: mockSendOtp,
    verifyOtp: mockVerifyOtp,
    loginWithGoogle: jest.fn(),
    googleClientId: "",
  });
  mockRegister.mockReset();
  mockSendOtp.mockReset();
  mockVerifyOtp.mockReset();
});

describe("SignupPage", () => {
  it("renders signup form (step 1) by default", () => {
    render(<SignupPage />);
    expect(screen.getByText("Join The Story.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jane Reader")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("At least 6 characters")).toBeInTheDocument();
    expect(screen.getByText("Send Verification Code")).toBeInTheDocument();
  });

  it("shows sign in link", () => {
    render(<SignupPage />);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("shows error for short password", () => {
    render(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), { target: { value: "abc" } });
    fireEvent.click(screen.getByText("Send Verification Code"));
    expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();
  });

  it("sends OTP and advances to step 2", async () => {
    mockSendOtp.mockResolvedValue({ dev_otp: "654321", sent: false });
    render(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText("Jane Reader"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), { target: { value: "password123" } });
    fireEvent.click(screen.getByText("Send Verification Code"));
    await waitFor(() => {
      expect(screen.getByText("Enter Your Code.")).toBeInTheDocument();
    });
    expect(screen.getByText(/654321/)).toBeInTheDocument();
  });

  it("shows resend button on step 2", async () => {
    mockSendOtp.mockResolvedValue({ dev_otp: "654321", sent: false });
    render(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText("Jane Reader"), { target: { value: "Test" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), { target: { value: "pass1234" } });
    fireEvent.click(screen.getByText("Send Verification Code"));
    await waitFor(() => {
      expect(screen.getByText(/Resend in 60s/i)).toBeInTheDocument();
    });
  });

  it("shows Google sign-in button when googleClientId is set", () => {
    mockUseAuth.mockReturnValue({
      register: mockRegister, sendOtp: mockSendOtp, verifyOtp: mockVerifyOtp,
      loginWithGoogle: jest.fn(), googleClientId: "test-client-id",
    });
    render(<SignupPage />);
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });
});
