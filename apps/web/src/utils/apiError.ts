import axios from "axios";

/** Extract a user-facing message from failed API calls. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error && typeof data.error === "string") return data.error;
    if (err.response?.status === 400) return "Check your input and try again.";
    if (err.response?.status === 401) return "Invalid email or password.";
    if (err.response?.status === 409) return data?.error ?? "This email is already registered.";
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
