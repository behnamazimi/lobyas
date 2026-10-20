"use client";

import { resetAnalytics } from "@/lib/analytics/track";
import {
  Bug,
  Compass,
  Download,
  LogOut,
  Settings,
  Signal,
  Sparkles,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/(private)/auth/actions";
import { markSignedOut, restoreSignedIn } from "@/lib/auth/auth-state";
import { ADMIN_NAV_ITEMS, emailInitials } from "@/components/app/account-nav";
import { AppRouterProvider } from "@/components/app-router-provider";
import { ReportIssueSheet } from "@/components/issues/report-issue-sheet";
import { INSTALL_MENU_LABEL, useInstallAction } from "@/components/pwa/install-prompt";
import { useAiCredits } from "@/hooks/use-ai-credits";
import { aiCreditsLine, type AiCreditsMenuMode } from "@/lib/ai-credits/menu-line";
import { ISSUE_COPY } from "@/lib/issues/copy";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEM_CLASS =
  "min-h-11 gap-3 rounded-2xl px-3 text-[15px] font-extrabold focus-visible:outline-none";
const SEPARATOR_CLASS = "mx-3 my-1";

const MENU_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/app/mastery", label: "Mastery", icon: Signal },
  { href: "/app/browse", label: "Browse collections", icon: Compass },
  { href: "/app/import", label: "Add a collection", icon: Upload },
];

function MenuIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="size-5 shrink-0" strokeWidth={2.3} aria-hidden />;
}

type ProfileMenuProps = {
  email: string;
  isAdmin?: boolean;
  aiCreditsMode: AiCreditsMenuMode;
};

export function ProfileMenu({ email, isAdmin = false, aiCreditsMode }: ProfileMenuProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { load: aiCreditsLoad, refresh: refreshAiCredits } = useAiCredits(aiCreditsMode);
  const creditsLine = aiCreditsLine(aiCreditsMode, aiCreditsLoad);
  const initials = emailInitials(email);
  const install = useInstallAction();

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

  return (
    <AppRouterProvider>
      <DropdownMenuTrigger onOpenChange={(open) => open && void refreshAiCredits()}>
        <Button
          variant="ghost"
          size="sm"
          className="btn-circle size-8 shrink-0 overflow-hidden bg-success-tint p-0 text-xs font-semibold text-success-text"
          aria-label="Account menu"
          data-tour="app-account"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-transparent text-xs font-semibold leading-none text-success-text">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
        <DropdownMenu className="min-w-[260px] rounded-3xl p-2 shadow-card">
          <DropdownMenuLabel className="flex items-center gap-3 px-3 py-3 font-normal">
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success-tint text-base font-extrabold text-success-text"
            >
              {initials}
            </span>
            <p className="m-0 min-w-0 truncate text-base font-extrabold text-base-content">
              {email}
            </p>
          </DropdownMenuLabel>
          {creditsLine ? (
            <DropdownMenuItem
              href={creditsLine.pending ? undefined : "/app/settings?tab=ai"}
              isDisabled={creditsLine.pending}
              textValue={creditsLine.label}
              className={cn(
                ITEM_CLASS,
                "mb-1 bg-quiz-tint text-quiz-text data-focused:bg-quiz-tint",
              )}
            >
              <MenuIcon icon={Sparkles} />
              <span className={cn("text-sm", creditsLine.tone === "error" && "text-error-text")}>
                {creditsLine.label}
              </span>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator className={SEPARATOR_CLASS} />
          {MENU_LINKS.map((item) => (
            <DropdownMenuItem key={item.href} href={item.href} className={ITEM_CLASS}>
              <MenuIcon icon={item.icon} />
              {item.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className={SEPARATOR_CLASS} />
          <DropdownMenuItem href="/app/settings" className={ITEM_CLASS}>
            <MenuIcon icon={Settings} />
            Settings
          </DropdownMenuItem>
          {isAdmin
            ? ADMIN_NAV_ITEMS.map((item) => (
                <DropdownMenuItem key={item.href} href={item.href} className={ITEM_CLASS}>
                  <MenuIcon icon={item.icon} />
                  {item.label}
                </DropdownMenuItem>
              ))
            : null}
          {install ? (
            <DropdownMenuItem onAction={install} className={ITEM_CLASS}>
              <MenuIcon icon={Download} />
              {INSTALL_MENU_LABEL}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onAction={() => setReportOpen(true)} className={ITEM_CLASS}>
            <MenuIcon icon={Bug} />
            {ISSUE_COPY.menuLabel}
          </DropdownMenuItem>
          <DropdownMenuSeparator className={SEPARATOR_CLASS} />
          <DropdownMenuItem
            variant="destructive"
            isDisabled={isBusy}
            onAction={handleLogout}
            className={ITEM_CLASS}
          >
            <MenuIcon icon={LogOut} />
            {isBusy ? "Logging out…" : "Log out"}
          </DropdownMenuItem>
        </DropdownMenu>
      </DropdownMenuTrigger>
      <ReportIssueSheet isOpen={reportOpen} onOpenChange={setReportOpen} />
    </AppRouterProvider>
  );
}
