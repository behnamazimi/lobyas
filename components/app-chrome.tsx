import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { ShellIsland } from "@/components/app/shell/shell-island";
import { ShellSkeleton } from "@/components/app/shell/shell-skeleton";
import { AnalyticsIdentity } from "@/components/pwa/analytics-identity";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { ConsentSyncIsland } from "@/components/consent/consent-sync-island";
import { SiteFooter } from "@/components/site-footer";
import { HeaderIsland } from "@/components/header-island";
import { HeaderSkeleton } from "@/components/page-skeleton";
import { TimezoneSyncIsland } from "@/components/timezone-sync-island";
import { TourIsland } from "@/components/tour/tour-island";
import { GoalsIsland } from "@/components/goals/goals-island";
import { getSessionUser, hasLikelySession } from "@/lib/auth/require-session";
import { BROWSER_TIMEZONE_SCRIPT } from "@/lib/streak/browser-timezone";
import { DARK_THEME } from "@/lib/theme";
import { getTheme } from "@/lib/theme-server";

/** The page frame for routes that know who is signed in: the site header, or
 *  the app shell, plus the per-account islands. Pages cached without a session
 *  use StaticChrome instead, so a layout shared with them never holds one
 *  person's account. */
export async function AppChrome({ children }: { children: React.ReactNode }) {
  const [theme, hasSession, { user }] = await Promise.all([
    getTheme(),
    hasLikelySession(),
    getSessionUser(),
  ]);
  const initialIsDark = theme === DARK_THEME;

  return (
    <>
      {user && <script dangerouslySetInnerHTML={{ __html: BROWSER_TIMEZONE_SCRIPT }} />}
      {user && <AnalyticsIdentity user={user} />}
      <AppShell
        header={
          <Suspense fallback={<HeaderSkeleton hasLikelySession={hasSession} />}>
            <HeaderIsland initialIsDark={initialIsDark} />
          </Suspense>
        }
        footer={<SiteFooter />}
        signedIn={Boolean(user)}
      >
        <Suspense fallback={null}>
          <TimezoneSyncIsland />
        </Suspense>
        <Suspense fallback={null}>
          <ConsentSyncIsland />
        </Suspense>
        <Suspense fallback={null}>
          <TourIsland />
        </Suspense>
        <Suspense fallback={null}>
          <GoalsIsland />
        </Suspense>
        <OfflineBanner />
        {user ? (
          <Suspense
            fallback={<ShellSkeleton initialIsDark={initialIsDark}>{children}</ShellSkeleton>}
          >
            <ShellIsland initialIsDark={initialIsDark}>{children}</ShellIsland>
          </Suspense>
        ) : (
          children
        )}
      </AppShell>
    </>
  );
}
