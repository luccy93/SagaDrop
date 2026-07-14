const mockAuthSendOtp = jest.fn();
const mockResetPassword = jest.fn();
const mockUseNavigate = jest.fn();

jest.mock("@/lib/api", () => ({
  authSendOtp: (...args) => mockAuthSendOtp(...args),
  resetPassword: (...args) => mockResetPassword(...args),
}));
jest.mock("@/components/PageLayout", () => "div");
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

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordPage from "./ForgotPasswordPage";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ForgotPasswordPage", () => {
  it("renders email form by default", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
    expect(screen.getByText("Send OTP")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("shows back to login link", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText(/Back to login/)).toBeInTheDocument();
  });

  it("shows OTP form after sending", async () => {
    mockAuthSendOtp.mockResolvedValue({ dev_otp: "123456" });
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "a@b.com" } });
    fireEvent.click(screen.getByText("Send OTP"));
    await waitFor(() => {
      expect(screen.getByText("Reset Password")).toBeInTheDocument();
    });
  });

  it("shows loading state while sending", () => {
    mockAuthSendOtp.mockReturnValue(new Promise(() => {}));
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "a@b.com" } });
    fireEvent.click(screen.getByText("Send OTP"));
    expect(screen.getByText(/Sending…/)).toBeInTheDocument();
  });
});
