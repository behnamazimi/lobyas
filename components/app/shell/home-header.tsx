"use client";

import { StreakBadge } from "@/components/streak-badge";
import { collectionTitleClass } from "@/lib/kit/text";
import { cn } from "@/lib/utils";
import { useShell } from "./shell-context";

/** Phone opens the sheet. Desktop uses the rail's popover, so the name is a heading. */
function CollectionTitle({
  name,
  sized,
  onOpen,
}: {
  name: string;
  sized: boolean;
  onOpen: () => void;
}) {
  const className = cn(
    "font-heading font-extrabold",
    sized ? collectionTitleClass(name) : "text-3xl",
  );
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className={cn("min-h-11 max-w-full text-start lg:hidden")}
      >
        <span className={className}>{name}</span>
      </button>
      <h1 className={cn("m-0 hidden max-w-full lg:block", className)}>{name}</h1>
    </>
  );
}

export function HomeHeader() {
  const { current, degraded, setSwitcherOpen, streak } = useShell();

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        {degraded ? (
          <h1 className="m-0 font-heading text-3xl font-extrabold">Home</h1>
        ) : (
          <CollectionTitle
            name={current ? current.name : "Add a collection"}
            sized={Boolean(current)}
            onOpen={() => setSwitcherOpen(true)}
          />
        )}
      </div>
      <StreakBadge streak={streak} className="lg:hidden" />
    </div>
  );
}
