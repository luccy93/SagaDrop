const React = require("react");

const mockContext = {
  user: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  sendOtp: jest.fn(),
  verifyOtp: jest.fn(),
  loginWithGoogle: jest.fn(),
  googleClientId: "",
  refreshUser: jest.fn(),
};

function AuthProvider({ children }) {
  return React.createElement(React.Fragment, null, children);
}

const useAuth = jest.fn(() => mockContext);

module.exports = { AuthProvider, useAuth };
