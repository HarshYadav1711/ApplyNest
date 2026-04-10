import axios from "axios";
import { dispatchSessionExpired } from "./sessionEvents";

const TOKEN_KEY = "applynest_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (
      axios.isAxiosError(err) &&
      err.response?.status === 401 &&
      err.config?.headers?.Authorization
    ) {
      setStoredToken(null);
      dispatchSessionExpired();
    }
    return Promise.reject(err);
  }
);
