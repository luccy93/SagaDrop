import { createContext, useContext, useEffect, useState } from "react";
import { authMe, authLogin, authRegister, authLogout } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = logged out

  useEffect(() => {
    authMe().then(setUser).catch(() => setUser(false));
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
