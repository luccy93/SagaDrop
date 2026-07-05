import { createContext, useContext, useEffect, useState } from "react";
import {
  authMe, authLogin, authRegister, authLogout,
  authSendOtp, authVerifyOtp, authGoogle,
  fetchPublicConfig,
} from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = logged out
  const [googleClientId, setGoogleClientId] = useState("");

  useEffect(() => {
    authMe().then(setUser).catch(() => setUser(false));
    fetchPublicConfig()
      .then((cfg) => setGoogleClientId(cfg.google_client_id || ""))
      .catch(() => {});
  }, []);

  const login = async (email, password) => {
    const u = await authLogin(email, password);
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const u = await authRegister(name, email, password);
    setUser(u);
    return u;
  };

  const logout = async () => {
    try { await authLogout(); } finally { setUser(false); }
  };

  const sendOtp = async (email, name, password, purpose = "signup") => {
    return await authSendOtp({ email, name, password, purpose });
  };

  const verifyOtp = async (email, otp, purpose = "signup") => {
    const u = await authVerifyOtp({ email, otp, purpose });
    setUser(u);
    return u;
  };

  const loginWithGoogle = async (access_token) => {
    const u = await authGoogle(access_token);
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{
      user, login, register, logout,
      sendOtp, verifyOtp, loginWithGoogle,
      googleClientId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
