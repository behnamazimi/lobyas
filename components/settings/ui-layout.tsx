"use client";

import { useEffect, type ReactNode } from "react";
import { Card } from "@/components/kit";
import { Label } from "@/components/ui/label";
import { PLATFORM_MEDIA } from "@/lib/platform";

export type SettingsTabId = "ai" | "account";

export function ScrollToSettingsPanel({ tab }: { tab: SettingsTabId }) {
  useEffect(() => {
    const id = `settings-panel-${tab}`;
    const behavior = window.matchMedia(PLATFORM_MEDIA.reducedMotion).matches ? "instant" : "smooth";

    function scrollToPanel(): boolean {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ block: "start", behavior });
      return true;
    }

    if (scrollToPanel()) return;

    const observer = new MutationObserver(() => {
      if (scrollToPanel()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [tab]);

  return null;
}

export function SettingsPanel({
  id,
  title,
  description,
  status,
  children,
}: {
  id: SettingsTabId;
  title: string;
  description?: ReactNode;
  status?: ReactNode;
  children: ReactNode;
}) {
  const headingId = `settings-heading-${id}`;

  return (
    <section
      id={`settings-panel-${id}`}
      data-tour={`settings-${id}`}
      aria-labelledby={headingId}
      className="scroll-mt-4 rounded-3xl"
    >
      <Card radius="md" className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={headingId} className="m-0 font-sans text-lg font-extrabold">
            {title}
          </h2>
          {status}
        </div>
        {description ? (
          <p className="mt-1 mb-2 text-[13px] leading-snug font-semibold text-muted">
            {description}
          </p>
        ) : null}
        <div className="space-y-4">{children}</div>
      </Card>
    </section>
  );
}

export function SettingsStack({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-base-300">{children}</div>;
}

export function SettingsRow({
  title,
  description,
  children,
  layout = "stacked",
  htmlFor,
  titleId,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  layout?: "stacked" | "inline";
  htmlFor?: string;
  titleId?: string;
}) {
  const heading = htmlFor ? (
    <Label htmlFor={htmlFor} className="m-0 text-[15px] font-extrabold">
      {title}
    </Label>
  ) : (
    <h3 id={titleId} className="m-0 font-sans text-[15px] font-extrabold">
      {title}
    </h3>
  );

  const copy = (
    <div className="min-w-0 space-y-0.5">
      {heading}
      {description ? (
        <div className="text-[13px] leading-snug font-semibold text-muted">{description}</div>
      ) : null}
    </div>
  );

  if (layout === "inline") {
    return (
      <div className="flex min-h-[52px] items-center justify-between gap-3 py-2">
        {copy}
        <div className="flex min-h-11 shrink-0 items-center">{children}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-3">
      {copy}
      <div className="min-w-0 space-y-3">{children}</div>
    </div>
  );
}

export function DangerZone({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[52px] flex-wrap items-center justify-between gap-3 border-t border-base-300 py-2">
      <div className="min-w-0 flex-1 basis-48">
        <h3 className="m-0 font-sans text-[15px] font-extrabold">{title}</h3>
        {description ? (
          <p className="m-0 text-[13px] leading-snug font-semibold text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
