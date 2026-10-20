import type { Metadata } from "next";
import { SectionTransition } from "@/components/shared/view-transitions";

export const metadata: Metadata = { title: "Library" };

/** The Library's frame. The collection switcher lives in the app shell, so
 *  this only holds the page. */
export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-base-200">
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 py-5 lg:max-w-[1120px] lg:px-10 lg:py-9">
        <SectionTransition>{children}</SectionTransition>
      </div>
    </div>
  );
}
