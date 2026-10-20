import type { Metadata } from "next";
import { FlowFrame } from "@/components/import/flow-frame";
import { PageHeader } from "@/components/kit";

export const metadata: Metadata = { title: "Me" };

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <FlowFrame>
      <PageHeader title="Me" />
      {children}
    </FlowFrame>
  );
}
