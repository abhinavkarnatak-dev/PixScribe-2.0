"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import type { PublicUser } from "@/server/services/auth.service";

interface AuthContextValue {
  user: PublicUser | null;
  credits: number;
  isSignedIn: boolean;
  /** Optimistically overwrite the balance after a generation or purchase. */
  setCredits: (credits: number) => void;
  setUser: (user: PublicUser | null) => void;
  /** Re-reads the user from the server. */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  isSigningOut: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: PublicUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<PublicUser | null>(initialUser);
  const [isSigningOut, startSignOut] = useTransition();
  const router = useRouter();

  const setCredits = useCallback((credits: number) => {
    setUser((current) => (current ? { ...current, credits } : current));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await apiRequest<{ user: PublicUser | null }>("/api/auth/me");
      setUser(data.user);
    } catch {
      // A failed refresh should not blow away a working session.
    }
  }, []);

  const signOut = useCallback(async () => {
    await apiRequest("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    startSignOut(() => {
      router.push("/");
      router.refresh();
    });
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      credits: user?.credits ?? 0,
      isSignedIn: Boolean(user),
      setCredits,
      setUser,
      refresh,
      signOut,
      isSigningOut,
    }),
    [user, setCredits, refresh, signOut, isSigningOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
