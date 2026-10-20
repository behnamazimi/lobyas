import type { Metadata } from "next";
import { FlowFrame } from "@/components/import/flow-frame";

export const metadata: Metadata = { title: "Add a term" };

export default function CaptureLayout({ children }: { children: React.ReactNode }) {
  return <FlowFrame>{children}</FlowFrame>;
}
