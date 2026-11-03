import { ChevronDown, X } from "lucide-react";
import type { ReactNode } from "react";
import { CLAMP_ONE_LINE } from "@/lib/kit/text";
import { cn } from "@/lib/utils";
import { IconButton } from "../controls/pill";
import { TONES, type Tone } from "../tones";

type StudyMode = { label: string; tone: Tone };
type StudyCollection = { name: string; onPress?: () => void };

/** The bar over a study screen. The first row holds close, the page's own
 *  controls (`center`, `end`); the second names the mode and collection, with
 *  today's goal as plain text. Only the first row and the collection, when it
 *  can be pressed, are buttons. */
export function StudyTopBar({
  closeHref,
  closeLabel = "Close and go home",
  mode,
  collection,
  goal,
  center,
  end,
  className,
}: {
  closeHref: string;
  closeLabel?: string;
  mode: StudyMode;
  collection: StudyCollection | null;
  goal?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="grid h-12 grid-cols-[1fr_auto_1fr] items-center gap-2">
        <IconButton label={closeLabel} href={closeHref} className="-ml-2 justify-self-start">
          <X className="size-6" strokeWidth={2.6} aria-hidden />
        </IconButton>
        <div className="flex min-w-0 items-center justify-center">{center}</div>
        <div className="-mr-2 flex min-w-0 items-center justify-end">{end}</div>
      </div>
      <div className="flex h-9 items-center justify-between gap-3">
        <StudyContext mode={mode} collection={collection} />
        {goal ? (
          <div className="shrink-0 text-[13px] font-bold text-muted tabular-nums">{goal}</div>
        ) : null}
      </div>
    </div>
  );
}

function StudyContext({
  mode,
  collection,
}: {
  mode: StudyMode;
  collection: StudyCollection | null;
}) {
  const body = (
    <>
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-full bg-current", TONES[mode.tone].text)}
      />
      <span className={cn("shrink-0 font-extrabold", TONES[mode.tone].text)}>{mode.label}</span>
      {collection ? (
        <>
          <span aria-hidden className="text-muted">
            ·
          </span>
          <span className={cn("min-w-0", CLAMP_ONE_LINE)}>{collection.name}</span>
          {collection.onPress ? (
            <ChevronDown className="size-4 shrink-0 text-muted" strokeWidth={2.6} aria-hidden />
          ) : null}
        </>
      ) : null}
    </>
  );
  const className = "flex h-9 min-w-0 items-center gap-1.5 text-sm font-bold text-ink-soft";
  if (!collection?.onPress) return <div className={className}>{body}</div>;
  return (
    <button
      type="button"
      aria-label={`${collection.name}, change collection`}
      onClick={collection.onPress}
      className={cn(className, "-mx-1.5 cursor-pointer rounded-lg px-1.5 hover:bg-base-100")}
    >
      {body}
    </button>
  );
}
