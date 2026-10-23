"use client";

import { ChevronDown, Plus } from "lucide-react";
import { Pill, ProgressBar } from "@/components/kit";
import { StreakBadge } from "@/components/streak-badge";
import { useShell } from "@/components/app/shell/shell-context";
import { collectionTitleClass, CLAMP_TWO_LINES, formatCount } from "@/lib/kit/text";
import { cn } from "@/lib/utils";

function desktopTitleClass(name: string): string {
  const length = Array.from(name).length;
  if (length <= 24) return "text-4xl/[1.25]";
  if (length <= 40) return "text-3xl/[1.25]";
  return "text-2xl/[1.25]";
}

function MasteryLine({
  name,
  mastered,
  total,
  className,
}: {
  name: string;
  mastered: number;
  total: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ProgressBar
        value={total > 0 ? mastered / total : 0}
        label={`${name} mastered`}
        className="w-24 lg:w-40"
      />
      <div className="text-[13px] font-bold text-muted lg:text-sm">
        <span className="font-extrabold text-base-content">{formatCount(mastered)}</span> of{" "}
        {formatCount(total)} mastered
      </div>
    </div>
  );
}

export function HomeHeader({
  name,
  mastered,
  total,
  note,
  cta,
  addTermsHref,
}: {
  name: string;
  mastered: number;
  total: number;
  note: string;
  cta: { href: string; label: string };
  addTermsHref: string;
}) {
  const { degraded, setSwitcherOpen, streak } = useShell();

  return (
    <>
      <header className="flex items-start justify-between gap-3 lg:hidden">
        <div className="min-w-0">
          <div className="pl-0.5 text-[13px] font-bold text-muted">Studying</div>
          {degraded ? (
            <h1 className="m-0 font-heading text-3xl font-extrabold">{name}</h1>
          ) : (
            <button
              type="button"
              onClick={() => setSwitcherOpen(true)}
              aria-label={`${name}, switch collection`}
              className="flex min-h-12 max-w-full items-center gap-2 text-start"
            >
              <span
                className={cn(
                  "font-heading font-extrabold",
                  collectionTitleClass(name),
                  CLAMP_TWO_LINES,
                )}
              >
                {name}
              </span>
              <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-base-100 shadow-card">
                <ChevronDown className="size-4" strokeWidth={3} aria-hidden />
              </span>
            </button>
          )}
          <MasteryLine name={name} mastered={mastered} total={total} className="mt-1 pl-0.5" />
        </div>
        <StreakBadge streak={streak} className="mt-5 shrink-0" />
      </header>

      <header className="hidden items-end justify-between gap-6 lg:flex">
        <div className="min-w-0">
          <div className="text-sm font-bold text-muted">Today · {note}</div>
          <h1
            className={cn(
              "m-0 mt-1 font-heading font-extrabold",
              desktopTitleClass(name),
              CLAMP_TWO_LINES,
            )}
          >
            {name}
          </h1>
          <MasteryLine name={name} mastered={mastered} total={total} className="mt-2.5" />
        </div>
        <div className="flex shrink-0 gap-2.5">
          <Pill href={addTermsHref} prefetch={false} variant="secondary" size="md" className="h-12">
            <Plus className="size-[18px]" strokeWidth={2.8} aria-hidden />
            Add terms
          </Pill>
          <Pill href={cta.href} className="h-12 px-6">
            {cta.label}
            <span aria-hidden>→</span>
          </Pill>
        </div>
      </header>
    </>
  );
}

/** Home with no collection to show: the streak stays on the phone header. */
export function HomeBareHeader() {
  const { streak } = useShell();
  return (
    <header className="flex items-center justify-between gap-3">
      <h1 className="m-0 font-heading text-3xl font-extrabold">Home</h1>
      <StreakBadge streak={streak} className="shrink-0 lg:hidden" />
    </header>
  );
}
