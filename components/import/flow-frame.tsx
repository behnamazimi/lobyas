import { SectionTransition } from "@/components/shared/view-transitions";

/** The page around Add a collection, Paste, Capture and Request: one centered column. */
export function FlowFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flow-fields flex flex-1 flex-col bg-base-200">
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 pt-5 pb-6 lg:pt-9">
        <SectionTransition>
          <div className="flex flex-1 flex-col gap-4">{children}</div>
        </SectionTransition>
      </div>
    </div>
  );
}
