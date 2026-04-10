import { http } from "./http";
import type { User } from "../types/auth";

export async function registerRequest(
  email: string,
  password: string
): Promise<{ accessToken: string; user: User }> {
  const { data } = await http.post<{ accessToken: string; user: User }>(
    "/api/auth/register",
    { email, password }
  );
  return data;
}

export async function loginRequest(
  email: string,
  password: string
): Promise<{ accessToken: string; user: User }> {
  const { data } = await http.post<{ accessToken: string; user: User }>(
    "/api/auth/login",
    { email, password }
  );
  return data;
}

export async function meRequest(): Promise<{ user: User }> {
  const { data } = await http.get<{ user: User }>("/api/auth/me");
  return data;
}
