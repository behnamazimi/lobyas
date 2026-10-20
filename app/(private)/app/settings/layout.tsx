import type { Metadata } from "next";
import { FlowFrame } from "@/components/import/flow-frame";
import { PageHeader } from "@/components/kit";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <FlowFrame>
      <PageHeader title="Settings" backHref="/app/me" />
      {children}
    </FlowFrame>
  );
}
