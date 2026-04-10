export const SESSION_EXPIRED_EVENT = "applynest:session-expired";

export function dispatchSessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}
