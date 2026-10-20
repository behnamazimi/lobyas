"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/** The blocks a learner moved under "More", with a row below them: More when
 *  there is something to open, then Customize. The row stays put while the hidden
 *  blocks open above it. A new card starts collapsed because callers key the body
 *  by term. */
export function MoreFooter({
  count,
  customize,
  children,
}: {
  count: number;
  customize?: ReactNode;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Collapsible
      isExpanded={expanded}
      onExpandedChange={setExpanded}
      className="flex flex-col gap-4"
    >
      <CollapsibleContent>
        <div className="flex flex-col gap-4">{children}</div>
      </CollapsibleContent>
      <div className="flex items-center justify-between gap-2 border-t border-base-300">
        {count > 0 ? (
          <CollapsibleTrigger className="flex min-h-12 cursor-pointer items-center gap-2 text-[15px] font-extrabold">
            {expanded ? "Less" : `More (${count})`}
            <ChevronDown
              className={cn("size-4 transition-transform", expanded && "rotate-180")}
              aria-hidden
              strokeWidth={3}
            />
          </CollapsibleTrigger>
        ) : (
          <span />
        )}
        {customize}
      </div>
    </Collapsible>
  );
}
