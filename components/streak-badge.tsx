"use client";

import { Flame } from "lucide-react";
import { useCallback, useState } from "react";
import { StreakModal } from "@/components/streak-modal";
import { type StreakSummary, withTodayDone } from "@/lib/streak/status";
import { cn } from "@/lib/utils";

/** Daily streak indicator in the header and the phone top bar. The flame is
 *  filled once today counts, an outline while today is still open, and the
 *  whole badge dims when there is no streak. Opens the streak modal. */
export function StreakBadge({
  streak: initialStreak,
  className,
  variant = "pill",
}: {
  streak: StreakSummary;
  className?: string;
  /** `row` is the Me list. `pill` is the phone Home header. `card` is the desktop rail. */
  variant?: "pill" | "row" | "card";
}) {
  const [isOpen, setIsOpen] = useState(false);
  // The header isn't re-rendered after studying, so the history the modal
  // loads can show today already counts.
  const [todaySeenActive, setTodaySeenActive] = useState(false);
  const [noticeSeen, setNoticeSeen] = useState(false);
  const withToday = todaySeenActive ? withTodayDone(initialStreak) : initialStreak;
  const streak = noticeSeen
    ? { ...withToday, shield: { ...withToday.shield, noticeDate: null } }
    : withToday;
  const markNoticeSeen = useCallback(() => setNoticeSeen(true), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          variant === "card"
            ? "flex w-full items-center gap-3 rounded-3xl bg-base-200 px-3 py-3 text-start"
            : variant === "row"
              ? "flex min-h-14 w-full items-center gap-3 rounded-2xl px-1 text-start"
              : "flex h-11 items-center gap-1.5 rounded-full bg-base-100 px-3.5 shadow-card",
          streak.current === 0 && "opacity-60",
          className,
        )}
        aria-label={`${streak.current} day streak. View streak history.`}
        data-tour={variant === "row" ? undefined : "app-streak"}
        data-streak-today={streak.doneToday ? "done" : "open"}
      >
        <Flame
          className={cn("size-5 shrink-0 text-streak", streak.doneToday && "fill-streak")}
          strokeWidth={2.4}
          aria-hidden
        />
        <span className="min-w-0">
          <span
            className={cn(
              "block leading-none font-extrabold tabular-nums",
              variant === "pill" ? "text-sm" : "text-base",
            )}
          >
            {variant === "pill" ? streak.current : `${streak.current} day streak`}
          </span>
          {variant === "card" ? (
            <span className="mt-1 block text-[13px] font-semibold text-muted">
              Longest {streak.longest}
            </span>
          ) : null}
        </span>
      </button>
      <StreakModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        streak={streak}
        onTodayActive={() => setTodaySeenActive(true)}
        onNoticeSeen={markNoticeSeen}
      />
    </>
  );
}
