import type { Metadata } from "next";
import { FlowFrame } from "@/components/import/flow-frame";

export const metadata: Metadata = {
  title: { default: "Add a collection", template: "%s | Lobyas" },
};

export default function ImportLayout({ children }: { children: React.ReactNode }) {
  return <FlowFrame>{children}</FlowFrame>;
}
