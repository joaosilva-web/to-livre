"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type UserShape = {
  id?: string;
  name?: string;
  email?: string;
  companyId?: string;
  roles?: string[];
} | null;

type SessionContextValue = {
  user: UserShape;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

let globalCachedUser: UserShape | null = null;
let globalCachedPromise: Promise<UserShape | null> | null = null;

async function fetchUserOnce(): Promise<UserShape | null> {
  if (globalCachedUser !== null) return globalCachedUser;
  if (globalCachedPromise) return globalCachedPromise;

  globalCachedPromise = fetch("/api/auth/whoami")
    .then(async (res) => {
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        globalCachedUser = null;
        return null;
      }

      // The API may return several shapes while migrating:
      // - { user: { ... } }
      // - { data: { user: { ... } } }
      // - { data: { ...user fields... } }
      // - { ...user fields... }
      const normalizeUserCandidate = (b: unknown) => {
        if (!b || typeof b !== "object") return null;
        const obj = b as Record<string, unknown>;
        // prefer explicit user
        if (obj.user && typeof obj.user === "object")
          return obj.user as Record<string, unknown>;
        // data.user
        if (obj.data && typeof obj.data === "object") {
          const d = obj.data as Record<string, unknown>;
          if (d.user && typeof d.user === "object")
            return d.user as Record<string, unknown>;
          // if data itself looks like the user fields, return data
          return d;
        }
        // fallback: maybe body is the user object
        return obj;
      };

      const userCandidate = normalizeUserCandidate(body);
      if (userCandidate && typeof userCandidate === "object") {
        const u = userCandidate as Record<string, unknown>;
        globalCachedUser = {
          id: typeof u.id === "string" ? u.id : undefined,
          name: typeof u.name === "string" ? u.name : undefined,
          email: typeof u.email === "string" ? u.email : undefined,
          companyId: typeof u.companyId === "string" ? u.companyId : undefined,
          roles: Array.isArray(u.roles)
            ? (u.roles.filter((r) => typeof r === "string") as string[])
            : undefined,
        };
      } else {
        globalCachedUser = null;
      }
      return globalCachedUser;
    })
    .catch(() => {
      globalCachedUser = null;
      return null;
    })
    .finally(() => {
      globalCachedPromise = null;
    });

  return globalCachedPromise;
}

// exported only for tests (avoid changing production behavior)
export { fetchUserOnce as __test_fetchUserOnce };

// test helper to clear module cache
export function __test_clearSessionCache() {
  globalCachedUser = null;
  globalCachedPromise = null;
}

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserShape>(globalCachedUser);
  const [loading, setLoading] = useState<boolean>(globalCachedUser === null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await fetchUserOnce();
      setUser(u);
      if (!u) setError("Não autenticado");
    } catch (err) {
      console.error("Session refresh error", err);
      setError(String(err ?? "Erro ao buscar sessão"));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (globalCachedUser !== null) return; // already have user
    let mounted = true;
    setLoading(true);
    fetchUserOnce()
      .then((u) => {
        if (!mounted) return;
        setUser(u);
        if (!u) setError("Não autenticado");
      })
      .catch(() => {
        if (!mounted) return;
        setError("Erro ao buscar sessão");
        setUser(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, error, refresh }}>
      {children}
    </SessionContext.Provider>
  );
};

export function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx)
    throw new Error("useSessionContext must be used within SessionProvider");
  return ctx;
}
