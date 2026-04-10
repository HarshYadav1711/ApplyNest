/**
 * Compare calendar days in local time for follow-up reminders.
 * Returns a badge state only when the date is set and not in the future.
 */
export type FollowUpBadgeState = "overdue" | "dueToday";

export function getFollowUpBadgeState(
  followUpDateIso: string | null | undefined
): FollowUpBadgeState | null {
  if (followUpDateIso == null || followUpDateIso === "") return null;
  const d = new Date(followUpDateIso);
  if (Number.isNaN(d.getTime())) return null;
  const follow = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  if (follow < today) return "overdue";
  if (follow === today) return "dueToday";
  return null;
}

export function countOverdueFollowUps(
  items: { followUpDate?: string | null }[]
): number {
  let n = 0;
  for (const item of items) {
    if (getFollowUpBadgeState(item.followUpDate) === "overdue") n += 1;
  }
  return n;
}

const OVERDUE_NOTIFY_SESSION_KEY = "applynest.overdueNotifyOnce";

/** Whether we already showed or declined the overdue notification flow this tab session. */
export function isOverdueNotifyHandledThisSession(): boolean {
  try {
    return sessionStorage.getItem(OVERDUE_NOTIFY_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOverdueNotifyHandledThisSession(): void {
  try {
    sessionStorage.setItem(OVERDUE_NOTIFY_SESSION_KEY, "1");
  } catch {
    /* quota / private mode */
  }
}

/** Shown in the browser notification and inline prompt. */
export function overdueFollowUpNotificationBody(count: number): string {
  if (count === 1) return "You have 1 overdue follow-up.";
  return `You have ${count} overdue follow-ups.`;
}
