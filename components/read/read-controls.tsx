"use client";

import { PageBadge } from "@/components/illustrations/scenes/page-badge";
import { usePathname, useSearchParams } from "next/navigation";
import { ModeLabel } from "@/components/kit";
import { ReadFocusButton } from "@/components/read/read-focus";
import { isStoriesPath, ReadModeSwitch } from "@/components/read/read-mode-tabs";
import { ReadOptionsMenu } from "@/components/read/read-options-menu";
import { StoryHistoryMenu } from "@/components/read/stories/story-history-menu";
import type { ReadOptions } from "@/lib/read/options";

/** The row under the study bar: the Read label, the Cards/Stories switch and
 *  the icons for options, focus mode (Cards) and history (Stories). */
export function ReadControls({ options }: { options: ReadOptions }) {
  const pathname = usePathname();
  const collection = useSearchParams().get("collection");

  return (
    <div className="flex items-center gap-1">
      <ModeLabel tone="read" icon={<PageBadge page="read" className="size-6" />}>
        Read
      </ModeLabel>
      <div className="ml-auto mr-1">
        <ReadModeSwitch pathname={pathname} collection={collection} />
      </div>
      <ReadOptionsMenu initialOptions={options} />
      {isStoriesPath(pathname) ? <StoryHistoryMenu /> : <ReadFocusButton />}
    </div>
  );
}
