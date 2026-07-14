module.exports = {
  useGoogleLogin: () => jest.fn(),
  GoogleOAuthProvider: ({ children }) => children,
};
