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
