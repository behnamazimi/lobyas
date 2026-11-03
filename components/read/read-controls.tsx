"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { StudyBarControls } from "@/components/app/shell/study-bar-slots";
import { ReadFocusButton } from "@/components/read/read-focus";
import { isStoriesPath, ReadModeSwitch } from "@/components/read/read-mode-tabs";
import { ReadOptionsMenu } from "@/components/read/read-options-menu";
import { StoryHistoryMenu } from "@/components/read/stories/story-history-menu";
import type { ReadOptions } from "@/lib/read/options";

/** Read's controls in the study bar: the Cards/Stories switch in the middle,
 *  and the options and focus mode (Cards) or history (Stories) icons. */
export function ReadControls({ options }: { options: ReadOptions }) {
  const pathname = usePathname();
  const collection = useSearchParams().get("collection");

  return (
    <StudyBarControls
      center={<ReadModeSwitch pathname={pathname} collection={collection} />}
      end={
        <>
          {isStoriesPath(pathname) ? <StoryHistoryMenu /> : <ReadFocusButton />}
          <ReadOptionsMenu initialOptions={options} />
        </>
      }
    />
  );
}
