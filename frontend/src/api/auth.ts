import { http } from "./http";
import type { UserDto } from "../types/api";

export async function registerRequest(
  email: string,
  password: string
): Promise<{ accessToken: string; user: UserDto }> {
  const { data } = await http.post<{ accessToken: string; user: UserDto }>(
    "/api/auth/register",
    { email, password }
  );
  return data;
}

export async function loginRequest(
  email: string,
  password: string
): Promise<{ accessToken: string; user: UserDto }> {
  const { data } = await http.post<{ accessToken: string; user: UserDto }>(
    "/api/auth/login",
    { email, password }
  );
  return data;
}

export async function meRequest(): Promise<{ user: UserDto }> {
  const { data } = await http.get<{ user: UserDto }>("/api/auth/me");
  return data;
}
