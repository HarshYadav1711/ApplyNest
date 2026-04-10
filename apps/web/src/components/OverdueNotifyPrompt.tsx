import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";
import {
  countOverdueFollowUps,
  isOverdueNotifyHandledThisSession,
  markOverdueNotifyHandledThisSession,
  overdueFollowUpNotificationBody,
} from "../utils/followUpReminder";
import type { Application } from "../types/application";

type Props = {
  whenReady: boolean;
  applications: Application[];
};

/**
 * On load: if any follow-ups are overdue, either shows one desktop notification
 * (permission already granted) or a polite inline prompt before requesting permission.
 * At most one notification / prompt flow per tab session — no spam.
 */
export function OverdueNotifyPrompt({ whenReady, applications }: Props) {
  const [showBanner, setShowBanner] = useState(false);
  const [busy, setBusy] = useState(false);
  const bannerOfferedRef = useRef(false);

  const overdue = countOverdueFollowUps(applications);

  useEffect(() => {
    if (!whenReady || applications.length === 0) return;
    if (isOverdueNotifyHandledThisSession()) return;
    if (overdue === 0) return;

    if (typeof Notification === "undefined") {
      markOverdueNotifyHandledThisSession();
      return;
    }

    const perm = Notification.permission;

    if (perm === "denied") {
      markOverdueNotifyHandledThisSession();
      return;
    }

    if (perm === "granted") {
      try {
        new Notification("ApplyNest", {
          body: overdueFollowUpNotificationBody(overdue),
          tag: "applynest-overdue-followup",
        });
      } catch {
        /* ignore */
      }
      markOverdueNotifyHandledThisSession();
      return;
    }

    // default — ask politely in-page before calling requestPermission()
    if (!bannerOfferedRef.current) {
      bannerOfferedRef.current = true;
      setShowBanner(true);
    }
  }, [whenReady, overdue, applications.length]);

  useEffect(() => {
    if (overdue > 0) return;
    setShowBanner(false);
    if (!isOverdueNotifyHandledThisSession()) {
      bannerOfferedRef.current = false;
    }
  }, [overdue]);

  async function handleAllow() {
    setBusy(true);
    try {
      const p =
        typeof Notification !== "undefined"
          ? await Notification.requestPermission()
          : "denied";
      if (p === "granted") {
        const n = countOverdueFollowUps(applications);
        if (n > 0) {
          try {
            new Notification("ApplyNest", {
              body: overdueFollowUpNotificationBody(n),
              tag: "applynest-overdue-followup",
            });
          } catch {
            /* ignore */
          }
        }
      }
    } finally {
      setBusy(false);
      setShowBanner(false);
      markOverdueNotifyHandledThisSession();
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    markOverdueNotifyHandledThisSession();
  }

  if (!showBanner) return null;

  return (
    <div
      className="mb-5 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 shadow-sm ring-1 ring-amber-900/[0.06]"
      role="region"
      aria-label="Follow-up reminders"
    >
      <p className="text-sm font-medium text-amber-950">
        {overdueFollowUpNotificationBody(overdue)}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-amber-900/85">
        Enable desktop notifications for a one-time reminder while you use
        ApplyNest this session. You can change this anytime in your browser
        settings.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          disabled={busy}
          onClick={() => void handleAllow()}
        >
          {busy ? "Waiting for browser…" : "Enable reminders"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={handleDismiss}
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
