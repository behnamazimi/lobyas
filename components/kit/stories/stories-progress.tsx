import { BookOpen, RotateCw, Zap } from "lucide-react";
import { MasteryStack, PathStop, ProgressBar, ProgressRing, QuizSegments } from "@/components/kit";
import { CLAMP_TWO_LINES, formatCount } from "@/lib/kit/text";
import { cn } from "@/lib/utils";
import { Story } from "./story";
import { COLLECTIONS } from "./fixtures";

export function ProgressStories() {
  return (
    <>
      <Story
        title="Progress ring"
        note="Goal rings per mode, at 0, half, met, and the small top-bar size."
      >
        <div className="flex flex-wrap items-center gap-4">
          <ProgressRing value={0} tone="read" label="Read, 0 of 10 today" />
          <ProgressRing value={0.5} tone="review" label="Review, 10 of 20 today" />
          <ProgressRing value={1} tone="quiz" label="Quiz, 10 of 10 today" />
          <ProgressRing
            value={0.6}
            tone="success"
            size={24}
            strokeWidth={10}
            label="6 of 10 today"
          />
          <ProgressRing value={0.4} tone="read" size={72}>
            <span className="text-lg font-extrabold tabular-nums">{formatCount(1024)}</span>
          </ProgressRing>
        </div>
      </Story>
      <Story
        title="Path stop"
        note="Home's stops: next up (filled), part way, met, and a tier without a goal."
      >
        <div className="flex flex-wrap items-center gap-4">
          <PathStop
            href="#"
            tone="read"
            label="Read, 4 of 10 today"
            ringValue={0.4}
            highlighted
            icon={<BookOpen className="size-8" strokeWidth={2.2} />}
          />
          <PathStop
            href="#"
            tone="review"
            label="Review, 10 of 10 today"
            ringValue={1}
            met
            icon={<RotateCw className="size-8" strokeWidth={2.2} />}
          />
          <PathStop
            href="#"
            tone="quiz"
            label="Quiz"
            icon={<Zap className="size-8" strokeWidth={2.2} />}
          />
        </div>
      </Story>
      <Story title="Bar and quiz segments">
        <ProgressBar value={0.64} label="64% mastered" />
        <div className="mt-4">
          <QuizSegments total={10} current={4} />
        </div>
        <div className="mt-4">
          <QuizSegments total={25} current={24} />
        </div>
      </Story>
      <Story title="Mastery stack" note="Includes a collection with 2,480 terms and a long name.">
        <div className="flex flex-col gap-5">
          {COLLECTIONS.map((collection) => (
            <div key={collection.name}>
              <div className={cn("mb-2 text-base font-extrabold", CLAMP_TWO_LINES)}>
                {collection.name}
              </div>
              <MasteryStack {...collection} />
            </div>
          ))}
        </div>
      </Story>
    </>
  );
}
