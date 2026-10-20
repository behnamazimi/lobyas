import type { Metadata } from "next";
import { FlowFrame } from "@/components/import/flow-frame";
import { PageHeader } from "@/components/kit";
import { PromoVisit } from "@/components/promos/promo-visit";

export const metadata: Metadata = { title: "Goals" };

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <FlowFrame>
      <PageHeader
        title="Goals"
        subline="A daily pace for each mode. Every goal is optional, and none is a limit."
      />
      <PromoVisit target="goals" />
      {children}
    </FlowFrame>
  );
}
