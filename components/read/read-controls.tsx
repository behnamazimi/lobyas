"use client";

import { BookOpen } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
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
      <div className="flex h-[30px] items-center gap-1.5 rounded-full bg-read-tint pr-3 pl-2.5 text-[13px] font-extrabold text-read-text">
        <BookOpen className="size-4" strokeWidth={2.6} aria-hidden />
        Read
      </div>
      <div className="ml-auto mr-1">
        <ReadModeSwitch pathname={pathname} collection={collection} />
      </div>
      <ReadOptionsMenu initialOptions={options} />
      {isStoriesPath(pathname) ? <StoryHistoryMenu /> : <ReadFocusButton />}
    </div>
  );
}
