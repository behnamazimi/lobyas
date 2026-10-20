"use client";

import { resetAnalytics } from "@/lib/analytics/track";
import { Bug, Compass, Download, LogOut, Settings, Signal, Sparkles, Upload } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { logout } from "@/app/(private)/auth/actions";
import { ADMIN_NAV_ITEMS, emailInitials } from "@/components/app/account-nav";
import { useShell } from "@/components/app/shell/shell-context";
import { StreakBadge } from "@/components/streak-badge";
import { pluralize } from "@/lib/utils";
import { ReportIssueSheet } from "@/components/issues/report-issue-sheet";
import { INSTALL_MENU_LABEL, useInstallAction } from "@/components/pwa/install-prompt";
import { ConsentSettingsButton } from "@/components/consent/consent-settings-button";
import { ListRow, Pill, SectionCard, SegmentedControl } from "@/components/kit";
import { TopUpSheet, type CreditsSummary } from "@/components/ai-credits/top-up-sheet";
import { markSignedOut, restoreSignedIn } from "@/lib/auth/auth-state";
import { ISSUE_COPY } from "@/lib/issues/copy";
import { LEGAL_LINKS } from "@/lib/site";
import { applyTheme, DARK_THEME, LIGHT_THEME } from "@/lib/theme";

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function readTheme(): string {
  return document.documentElement.getAttribute("data-theme") === DARK_THEME
    ? DARK_THEME
    : LIGHT_THEME;
}

export function MeMenu({ credits }: { credits: CreditsSummary | null }) {
  const { email, isAdmin, initialIsDark, streak } = useShell();
  const install = useInstallAction();
  const [reportOpen, setReportOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, () =>
    initialIsDark ? DARK_THEME : LIGHT_THEME,
  );

  async function handleLogout() {
    setIsBusy(true);
    resetAnalytics();
    markSignedOut();
    try {
      await logout();
    } catch {
      restoreSignedIn();
      setIsBusy(false);
    }
  }

  const icon = (Icon: typeof Signal) => <Icon className="size-5" strokeWidth={2.3} aria-hidden />;

  return (
    <div className="flex flex-col gap-4">
      <SectionCard className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-success-tint text-lg font-extrabold text-success-text"
          >
            {emailInitials(email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-base font-extrabold">{email}</p>
            <StreakBadge streak={streak} variant="row" className="min-h-0 p-0" />
          </div>
        </div>
        {credits ? (
          <div className="flex items-center gap-2.5 rounded-2xl bg-quiz-tint py-2.5 pr-2 pl-3 text-quiz-text">
            <Sparkles className="size-5 shrink-0" strokeWidth={2.2} aria-hidden />
            <p className="m-0 flex-1 text-sm font-bold">
              {credits.remaining > 0 ? (
                <>
                  <strong className="font-extrabold">
                    {pluralize(credits.remaining, "AI credit")}
                  </strong>{" "}
                  for AI quizzes and Stories
                </>
              ) : (
                <strong className="font-extrabold">No AI credits left</strong>
              )}
            </p>
            <Pill
              variant="secondary"
              className="text-quiz-text"
              onClick={() => setCreditsOpen(true)}
            >
              Details
            </Pill>
          </div>
        ) : null}
      </SectionCard>
      <SectionCard className="py-1">
        <ListRow
          href="/app/mastery"
          label="Mastery"
          subline="How well you remember your terms"
          tone="success"
          icon={icon(Signal)}
        />
        <ListRow
          href="/app/browse"
          label="Browse collections"
          subline="Built-in and community collections"
          tone="read"
          icon={icon(Compass)}
        />
        <ListRow
          href="/app/import"
          label="Add a collection"
          subline="Paste a list, import or add one term"
          tone="wrong"
          icon={icon(Upload)}
        />
      </SectionCard>
      <SectionCard className="py-1">
        <ListRow
          href="/app/settings"
          label="Settings"
          subline="AI credits, widget, account"
          icon={icon(Settings)}
        />
        {isAdmin
          ? ADMIN_NAV_ITEMS.map((item) => (
              <ListRow key={item.href} href={item.href} label={item.label} icon={icon(item.icon)} />
            ))
          : null}
        <div className="flex min-h-14 items-center gap-3 px-1 py-2">
          <span className="min-w-0 flex-1 text-base font-extrabold">Theme</span>
          <SegmentedControl
            label="Theme"
            value={theme}
            onChange={(value) => applyTheme(value === DARK_THEME ? DARK_THEME : LIGHT_THEME)}
            options={[
              { value: LIGHT_THEME, label: "Light" },
              { value: DARK_THEME, label: "Dim" },
            ]}
            className="w-44"
          />
        </div>
        {install ? (
          <ListRow
            label={INSTALL_MENU_LABEL}
            subline="Add it to your home screen"
            icon={icon(Download)}
            onPress={install}
          />
        ) : null}
        <ListRow
          label={ISSUE_COPY.menuLabel}
          subline="Something broken, or an idea"
          icon={icon(Bug)}
          onPress={() => setReportOpen(true)}
        />
      </SectionCard>
      <SectionCard className="py-1">
        <ListRow
          label={isBusy ? "Logging out…" : "Log out"}
          icon={icon(LogOut)}
          onPress={() => void handleLogout()}
          danger
        />
      </SectionCard>
      <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-5 px-2">
        {LEGAL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex min-h-11 items-center text-sm font-semibold text-muted underline underline-offset-2"
          >
            {link.label}
          </a>
        ))}
        <ConsentSettingsButton className="flex min-h-11 items-center" />
      </nav>
      <ReportIssueSheet isOpen={reportOpen} onOpenChange={setReportOpen} />
      {credits ? (
        <TopUpSheet isOpen={creditsOpen} onOpenChange={setCreditsOpen} credits={credits} />
      ) : null}
    </div>
  );
}
