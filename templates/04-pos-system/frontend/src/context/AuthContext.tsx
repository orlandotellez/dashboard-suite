import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, type AuthUser } from "@/api/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshAttempted = useRef(false);

  useEffect(() => {
    // StrictMode monta/desmonta/monta los efectos en dev.
    // Sin este guard el refresh se ejecuta dos veces y la
    // segunda llamada falla porque la primera ya roto el token.
    if (refreshAttempted.current) return;
    refreshAttempted.current = true;

    const stored = localStorage.getItem("auth-user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("auth-user");
      }
    }

    authApi.refresh()
      .then((res) => {
        // Actualizamos user con data fresca del servidor
        setUser(res.user);
        localStorage.setItem("auth-user", JSON.stringify(res.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("auth-user");
      })
      .finally(() => setLoading(false));
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
