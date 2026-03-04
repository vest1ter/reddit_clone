import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient, CurrentUserResponse } from "../api/client";

interface AuthState {
  user: CurrentUserResponse | null;
  loading: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const me = await apiClient.getMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logoutUser();
    } catch {
      // ignore network errors; we still clear local auth state
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiClient.getMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refetch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** True if current user can delete posts (moderator or admin). */
export function canDeletePost(role: string | undefined): boolean {
  return role === "moderator" || role === "admin";
}

/** True if current user can delete threads and manage roles (admin). */
export function canDeleteThread(role: string | undefined): boolean {
  return role === "admin";
}
