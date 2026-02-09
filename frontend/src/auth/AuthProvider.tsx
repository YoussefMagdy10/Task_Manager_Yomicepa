import React from "react";
import { me, refresh, logout as apiLogout } from "../api/auth";
import { setAccessToken } from "../api/http";

type AuthUser = { id: string; email: string; username: string };

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  booting: boolean;
  signinWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = React.createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [booting, setBooting] = React.useState(true);

  async function signinWithToken(t: string) {
    setToken(t);
    setAccessToken(t);
    const res = await me();
    setUser(res.user);
  }

  async function doLogout() {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setToken(null);
      setAccessToken(null);
    }
  }

  // Boot: try silent refresh -> load /api/me
  React.useEffect(() => {
    (async () => {
      try {
        const r = await refresh();
        await signinWithToken(r.accessToken);
      } catch {
        // not logged in
        setUser(null);
        setToken(null);
        setAccessToken(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const value: AuthState = {
    user,
    accessToken: token,
    booting,
    signinWithToken,
    logout: doLogout,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
