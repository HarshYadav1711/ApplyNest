import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth";
import { getStoredToken, setStoredToken } from "../api/http";
import { SESSION_EXPIRED_EVENT } from "../api/sessionEvents";
import type { User } from "../types/auth";

interface AuthState {
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getStoredToken()
  );

  useEffect(() => {
    function onSessionExpired() {
      setAccessToken(null);
      setStoredToken(null);
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [queryClient]);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.meRequest(),
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.loginRequest(email, password),
    onSuccess: (data) => {
      setStoredToken(data.accessToken);
      setAccessToken(data.accessToken);
      queryClient.setQueryData(["auth", "me"], { user: data.user });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.registerRequest(email, password),
    onSuccess: (data) => {
      setStoredToken(data.accessToken);
      setAccessToken(data.accessToken);
      queryClient.setQueryData(["auth", "me"], { user: data.user });
    },
  });

  const logout = useCallback(() => {
    setStoredToken(null);
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: ["auth", "me"] });
    queryClient.clear();
  }, [queryClient]);

  const user = meQuery.data?.user ?? null;
  const isBootstrapping = Boolean(accessToken) && meQuery.isLoading;
  const isAuthenticated =
    Boolean(accessToken) && meQuery.isSuccess && Boolean(user);

  const value = useMemo<AuthState>(
    () => ({
      user: isAuthenticated ? user : null,
      isBootstrapping,
      isAuthenticated,
      login: async (email, password) => {
        await loginMutation.mutateAsync({ email, password });
      },
      register: async (email, password) => {
        await registerMutation.mutateAsync({ email, password });
      },
      logout,
    }),
    [
      user,
      isBootstrapping,
      isAuthenticated,
      loginMutation,
      registerMutation,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
