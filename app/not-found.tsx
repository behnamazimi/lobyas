import type { Metadata } from "next";
import { AppChrome } from "@/components/app-chrome";
import { NotFoundScene } from "@/components/illustrations/scenes/not-found";
import { Pill, StatusScreen } from "@/components/kit";
import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/safe-next-path";
import { hasLikelySession } from "@/lib/auth/require-session";

export const metadata: Metadata = { title: "Page not found" };

export default async function NotFound() {
  const signedIn = await hasLikelySession();

  return (
    <AppChrome>
      <StatusScreen
        illustration={<NotFoundScene />}
        title="We can’t find that page"
        description="The link may be old, or the collection may no longer be shared."
        actions={
          <>
            <Pill variant="brand" href={signedIn ? AUTHENTICATED_HOME_PATH : "/"}>
              Go home
            </Pill>
            {signedIn ? (
              <Pill href="/app/browse" variant="secondary">
                Browse collections
              </Pill>
            ) : null}
          </>
        }
      />
    </AppChrome>
  );
}
