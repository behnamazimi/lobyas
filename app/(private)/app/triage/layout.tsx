import type { Metadata } from "next";
import { PromoVisit } from "@/components/promos/promo-visit";
import { TermLayoutScope } from "@/components/terms/term-layout-scope";
import { SectionTransition } from "@/components/shared/view-transitions";

export const metadata: Metadata = { title: "Triage" };

export default function TriageLayout({ children }: { children: React.ReactNode }) {
  return (
    <TermLayoutScope>
      <SectionTransition>
        <div className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col gap-3 px-5 pt-1 pb-[max(1rem,var(--safe-bottom))] md:pb-6">
          <PromoVisit target="triage" />
          {children}
        </div>
      </SectionTransition>
    </TermLayoutScope>
  );
}
