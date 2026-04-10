import axios from "axios";

/** Extract a user-facing message from failed API calls. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Could not reach the server. Check your connection and try again.";
    }
    const data = err.response.data as { error?: string } | undefined;
    const status = err.response.status;
    if (data?.error && typeof data.error === "string") return data.error;
    if (status === 400) return "Check your input and try again.";
    if (status === 401) return "Invalid email or password.";
    if (status === 403) return "You do not have permission to do that.";
    if (status === 404) return "That resource was not found.";
    if (status === 409) return data?.error ?? "This email is already registered.";
    if (status >= 500) {
      return "The server had a problem. Please try again in a moment.";
    }
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}
