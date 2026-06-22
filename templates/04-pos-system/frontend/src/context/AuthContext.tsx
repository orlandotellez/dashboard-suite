import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, type AuthUser } from "@/api/auth";

const REFRESH_INTERVAL = 14 * 60 * 1000;

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("auth-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem("auth-user");
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      authApi.refresh()
        .then((res) => {
          setUser(res.user);
          localStorage.setItem("auth-user", JSON.stringify(res.user));
        })
        .catch((err) => {
          console.warn("[Auth] Background refresh failed:", err?.status ?? "", err?.message ?? "");
        });
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("auth-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth-user");
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setUser(res.user);
      navigate("/pos");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {}
    setUser(null);
    navigate("/auth");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
