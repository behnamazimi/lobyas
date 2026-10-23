import Link from "next/link";
import { ProgressRing, SectionCard, Tile } from "@/components/kit";
import { collectionLetter, collectionTone } from "@/components/app/shell/collection-look";
import type { ShellCollection } from "@/components/app/shell/shell-context";
import { GoalPrompt } from "./goal-prompt";
import { QUEUE_NOUNS, type HomePathData } from "@/lib/home/path";
import { CLAMP_TWO_LINES, formatCount } from "@/lib/kit/text";
import { countLabel, kindLine, type CollectionKind } from "@/lib/terms/kinds";
import type { CollectionLanguage } from "@/lib/terms/languages";
import { cn } from "@/lib/utils";

const chip =
  "flex h-11 items-center rounded-full bg-base-200 px-3.5 text-sm font-extrabold text-base-content";

function GoalsCard({ data }: { data: HomePathData }) {
  return (
    <SectionCard className="p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="m-0 font-sans text-lg font-extrabold">Today’s goals</h2>
        <Link
          href="/app/goals"
          prefetch={false}
          className="flex min-h-11 items-center text-sm font-extrabold text-info-text"
        >
          Edit pace
        </Link>
      </div>
      <ul className="m-0 list-none p-0">
        {data.stops.map((stop) => (
          <li key={stop.tier} className="border-t border-base-300">
            <Link
              href={stop.href}
              prefetch={false}
              className="flex min-h-14 items-center gap-3 text-base-content"
            >
              {stop.ringValue !== null ? (
                <ProgressRing value={stop.ringValue} tone={stop.tier} size={28} strokeWidth={12} />
              ) : (
                <span className="size-7" aria-hidden />
              )}
              <span className="flex-1 text-[15px] font-extrabold">{stop.label}</span>
              <span className="text-sm font-extrabold text-muted">
                {stop.short ?? stop.queueLine}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 mb-0 text-[13px] leading-snug font-semibold text-muted">
        Goals are a pace, not a limit. Stop whenever you like.
      </p>
    </SectionCard>
  );
}

function CollectionCard({ collection }: { collection: ShellCollection }) {
  const kind = collection.kind as CollectionKind;
  const queues = [
    {
      label: QUEUE_NOUNS.read,
      value: collection.queues.read,
      tone: "bg-read-tint text-read-text",
    },
    {
      label: QUEUE_NOUNS.review,
      value: collection.queues.review,
      tone: "bg-review-tint text-review-text",
    },
    {
      label: QUEUE_NOUNS.quiz,
      value: collection.queues.quiz,
      tone: "bg-quiz-tint text-quiz-text",
    },
  ];
  return (
    <SectionCard className="p-5">
      <div className="flex items-center gap-3">
        <Tile tone={collectionTone(kind)} size={48} serif>
          {collectionLetter(collection.name)}
        </Tile>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-muted">
            {kindLine(kind, collection.language as CollectionLanguage)} ·{" "}
            {countLabel(kind, collection.termCount).replace(
              /^\d+/,
              formatCount(collection.termCount),
            )}
          </div>
          <h2 className={cn("m-0 font-heading text-[22px]/[1.25] font-extrabold", CLAMP_TWO_LINES)}>
            {collection.name}
          </h2>
        </div>
      </div>
      {collection.description ? (
        <p
          className={cn(
            "mt-3 mb-0 text-sm leading-snug font-semibold text-ink-soft",
            CLAMP_TWO_LINES,
          )}
        >
          {collection.description}
        </p>
      ) : null}
      <dl className="m-0 mt-3.5 grid grid-cols-3 gap-2 text-center">
        {queues.map((queue) => (
          <div key={queue.label} className={cn("rounded-2xl py-2.5", queue.tone)}>
            <dd className="m-0 text-xl font-extrabold">{formatCount(queue.value)}</dd>
            <dt className="text-xs font-extrabold">{queue.label}</dt>
          </div>
        ))}
      </dl>
      <div className="mt-3.5 flex flex-wrap gap-2">
        <Link href={`/app/library?collection=${collection.id}`} prefetch={false} className={chip}>
          Open in Library
        </Link>
        <Link href="/app/read/stories" prefetch={false} className={chip}>
          Stories
        </Link>
        <Link href="/app/triage" prefetch={false} className={chip}>
          Triage
        </Link>
      </div>
    </SectionCard>
  );
}

/** Desktop only: today's goals (or the pace prompt) and the collection card. Under
 *  about 1180px it drops below the path and the two cards sit side by side. */
export function HomeSide({
  data,
  collection,
}: {
  data: HomePathData;
  collection: ShellCollection;
}) {
  return (
    <div className="hidden min-w-0 flex-[1_0_340px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-4 lg:grid">
      {data.hasGoals ? <GoalsCard data={data} /> : <GoalPrompt />}
      <CollectionCard collection={collection} />
    </div>
  );
}
