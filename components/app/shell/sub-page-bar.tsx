"use client";

import { usePathname, useRouter } from "next/navigation";
import { studyScreenTitle } from "@/components/app/account-nav";
import { PageHeader } from "@/components/kit";
import { subPageFallback } from "@/lib/chrome";
import { useShell } from "./shell-context";

export function SubPageBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasInAppHistory } = useShell();
  const fallback = subPageFallback(pathname);

  return (
    <div className="px-4 pt-safe lg:hidden">
      <PageHeader
        title={studyScreenTitle(pathname)}
        backHref={hasInAppHistory ? undefined : fallback}
        onBack={hasInAppHistory ? () => router.back() : undefined}
      />
    </div>
  );
}
