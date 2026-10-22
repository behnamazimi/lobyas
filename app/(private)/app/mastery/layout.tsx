import { SwitchingFallback } from "@/components/app/shell/switching-fallback";
import MasteryLoading from "./loading";
import type { Metadata } from "next";
import { FlowFrame } from "@/components/import/flow-frame";
import { PageHeader } from "@/components/kit";
import { PromoVisit } from "@/components/promos/promo-visit";

export const metadata: Metadata = { title: "Mastery" };

export default function MasteryLayout({ children }: { children: React.ReactNode }) {
  return (
    <FlowFrame>
      <PageHeader title="Mastery" subline="How well you remember your terms." backHref="/app/me" />
      <PromoVisit target="mastery" />
      <SwitchingFallback fallback={<MasteryLoading />}>{children}</SwitchingFallback>
    </FlowFrame>
  );
}
