import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest, setToken, clearToken } from "../api/client";

interface Client { id: string; clientNo: string; firstName: string; lastName: string; }
interface StaffProfile { id: string; firstName: string; lastName: string; title: string | null; }
interface User { id: string; email: string; role: string; client?: Client | null; staff?: StaffProfile | null; }

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<User>("/auth/me").then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await apiRequest<{ token: string; user: User }>("/auth/login", { method: "POST", body: { email, password } });
    setToken(res.token);
    setUser(res.user);
  }

  function logout() { clearToken(); setUser(null); }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  heroImageUrl: string;
  primaryColor: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string;
}

const SettingsContext = createContext<BusinessSettings | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    apiRequest<BusinessSettings>("/settings").then((s) => {
      setSettings(s);
      document.documentElement.style.setProperty("--brand-primary", s.primaryColor);
      document.title = s.businessName;
    });
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
