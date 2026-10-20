import type { Metadata } from "next";
import { FlowFrame } from "@/components/import/flow-frame";
import { PageHeader } from "@/components/kit";
import { PromoVisit } from "@/components/promos/promo-visit";

export const metadata: Metadata = { title: "Browse collections" };

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <FlowFrame>
      <PageHeader
        title="Browse collections"
        subline="Add built-in collections, or community ones other members have shared."
        backHref="/app/me"
      />
      <PromoVisit target="browse" />
      {children}
    </FlowFrame>
  );
}
