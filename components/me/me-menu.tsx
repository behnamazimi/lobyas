"use client";

import { resetAnalytics } from "@/lib/analytics/track";
import { Bug, Download, LogOut, Sparkles } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { logout } from "@/app/(private)/auth/actions";
import { ACCOUNT_OVERFLOW_NAV, ADMIN_NAV_ITEMS } from "@/components/app/account-nav";
import { useShell } from "@/components/app/shell/shell-context";
import { StreakBadge } from "@/components/streak-badge";
import { ReportIssueDialog } from "@/components/issues/report-issue-dialog";
import { INSTALL_MENU_LABEL, useInstallAction } from "@/components/pwa/install-prompt";
import { ConsentSettingsButton } from "@/components/consent/consent-settings-button";
import { ListRow, SectionCard, SegmentedControl } from "@/components/kit";
import { markSignedOut, restoreSignedIn } from "@/lib/auth/auth-state";
import {
  aiCreditsLine,
  type AiCreditsLoad,
  type AiCreditsMenuMode,
} from "@/lib/ai-credits/menu-line";
import { ISSUE_COPY } from "@/lib/issues/copy";
import { LEGAL_LINKS } from "@/lib/site";
import { applyTheme, DARK_THEME, LIGHT_THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

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

const ME_LINKS = ["/app/mastery", "/app/browse", "/app/import", "/app/settings"];

export function MeMenu({
  aiCreditsMode,
  creditsLoad,
}: {
  aiCreditsMode: AiCreditsMenuMode;
  creditsLoad: AiCreditsLoad;
}) {
  const { email, isAdmin, initialIsDark, streak } = useShell();
  const credits = aiCreditsLine(aiCreditsMode, creditsLoad);
  const install = useInstallAction();
  const [reportOpen, setReportOpen] = useState(false);
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

  const rows = ME_LINKS.map((href) => ACCOUNT_OVERFLOW_NAV.find((item) => item.href === href)!);

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-5 py-6">
      <h1 className="m-0 font-heading text-3xl font-extrabold">Me</h1>
      <SectionCard>
        <StreakBadge streak={streak} variant="row" />
        <p className="m-0 truncate px-1 pb-2 text-sm font-semibold text-muted">{email}</p>
      </SectionCard>
      <SectionCard>
        {rows.map((item) => (
          <ListRow
            key={item.href}
            href={item.href}
            label={item.href === "/app/import" ? "Add a collection" : item.label}
            subline={item.href === "/app/settings" ? "AI credits, widget, account" : undefined}
            icon={<item.icon className="size-5" strokeWidth={2.3} aria-hidden />}
          />
        ))}
        {isAdmin
          ? ADMIN_NAV_ITEMS.map((item) => (
              <ListRow
                key={item.href}
                href={item.href}
                label={item.label}
                icon={<item.icon className="size-5" strokeWidth={2.3} aria-hidden />}
              />
            ))
          : null}
        {install ? (
          <ListRow
            label={INSTALL_MENU_LABEL}
            icon={<Download className="size-5" strokeWidth={2.3} aria-hidden />}
            onPress={install}
          />
        ) : null}
        <ListRow
          label={ISSUE_COPY.menuLabel}
          icon={<Bug className="size-5" strokeWidth={2.3} aria-hidden />}
          onPress={() => setReportOpen(true)}
        />
      </SectionCard>
      {credits ? (
        <SectionCard>
          <ListRow
            href={credits.pending ? undefined : "/app/settings?tab=ai"}
            label={credits.label}
            icon={<Sparkles className="size-5" strokeWidth={2.3} aria-hidden />}
            className={cn(credits.tone === "error" && "text-error-text")}
          />
        </SectionCard>
      ) : null}
      <SectionCard title="Theme">
        <div className="px-1 py-2">
          <SegmentedControl
            label="Theme"
            value={theme}
            onChange={(value) => applyTheme(value === DARK_THEME ? DARK_THEME : LIGHT_THEME)}
            options={[
              { value: LIGHT_THEME, label: "Light" },
              { value: DARK_THEME, label: "Dim" },
            ]}
          />
        </div>
      </SectionCard>
      <SectionCard>
        <ListRow
          label={isBusy ? "Logging out…" : "Log out"}
          icon={<LogOut className="size-5" strokeWidth={2.3} aria-hidden />}
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
      <ReportIssueDialog isOpen={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
