import type { Metadata } from "next";
import { PromoVisit } from "@/components/promos/promo-visit";
import { SectionTransition } from "@/components/shared/view-transitions";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionTransition>
      <div className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col gap-3 px-5 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-6">
        <PromoVisit target="quiz" />
        {children}
      </div>
    </SectionTransition>
  );
}
