import { SwitchingFallback } from "@/components/app/shell/switching-fallback";
import ReadLoading from "./loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ReadControls } from "@/components/read/read-controls";
import { ReadFocusProvider } from "@/components/read/read-focus";
import { KeepAwake } from "@/components/shared/keep-awake";
import { PromoSlot } from "@/components/promos/promo-slot";
import { TermLayoutScope } from "@/components/terms/term-layout-scope";
import { getSessionUser } from "@/lib/auth/require-session";
import { DEFAULT_READ_OPTIONS, getReadOptions } from "@/lib/read/options";
import { SectionTransition } from "@/components/shared/view-transitions";

export const metadata: Metadata = { title: "Read" };

export default async function ReadLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await getSessionUser();
  const options = user
    ? await getReadOptions(supabase, user.id).catch(() => DEFAULT_READ_OPTIONS)
    : DEFAULT_READ_OPTIONS;

  return (
    <ReadFocusProvider>
      <KeepAwake enabled={options.keepAwake} />
      <TermLayoutScope>
        <SectionTransition>
          <div className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col gap-3 px-5 pt-1 pb-[max(1rem,var(--safe-bottom))] md:pb-6">
            <PromoSlot route="read" />
            {user ? (
              <Suspense fallback={<div className="h-11" />}>
                <ReadControls options={options} />
              </Suspense>
            ) : null}
            <SwitchingFallback fallback={<ReadLoading />}>{children}</SwitchingFallback>
          </div>
        </SectionTransition>
      </TermLayoutScope>
    </ReadFocusProvider>
  );
}
