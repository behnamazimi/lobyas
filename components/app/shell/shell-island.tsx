import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { getSessionUser, getUserIsAdmin } from "@/lib/auth/require-session";
import { CURRENT_COLLECTION_COOKIE, parseCurrentCollectionId } from "@/lib/collections/current";
import { loadLibraryCollections } from "@/lib/library/load";
import { EMPTY_STREAK } from "@/lib/streak/status";
import { getStudyPhoneUserSettings } from "@/lib/streak/settings";
import { ShellFrame } from "./shell-frame";
import { ShellProvider, type ShellCollection } from "./shell-context";

const DESCRIPTION_LIMIT = 200;

export async function ShellIsland({
  initialIsDark,
  children,
}: {
  initialIsDark: boolean;
  children: ReactNode;
}) {
  const { supabase, user } = await getSessionUser();
  if (!user) return <main className="flex min-h-0 flex-1 flex-col">{children}</main>;

  const [admin, settings, library] = await Promise.allSettled([
    getUserIsAdmin(user.id),
    getStudyPhoneUserSettings(user.id),
    loadLibraryCollections(supabase, user.id),
  ]);
  const collections: ShellCollection[] =
    library.status === "fulfilled"
      ? library.value.collections.map((collection) => ({
          id: collection.id,
          name: collection.name,
          kind: collection.kind,
          termCount: collection.termCount,
          termsLearnedCount: collection.termsLearnedCount,
          queues: collection.queues,
          description: collection.description.slice(0, DESCRIPTION_LIMIT) || null,
          language: collection.language,
          isActiveForReview: collection.isActiveForReview,
        }))
      : [];
  const cookieStore = await cookies();

  return (
    <ShellProvider
      email={user.email ?? "Account"}
      isAdmin={admin.status === "fulfilled" ? admin.value : false}
      initialIsDark={initialIsDark}
      streak={settings.status === "fulfilled" ? settings.value.streak : EMPTY_STREAK}
      collections={collections}
      currentId={parseCurrentCollectionId(cookieStore.get(CURRENT_COLLECTION_COOKIE)?.value)}
      degraded={library.status === "rejected"}
    >
      <ShellFrame>{children}</ShellFrame>
    </ShellProvider>
  );
}
