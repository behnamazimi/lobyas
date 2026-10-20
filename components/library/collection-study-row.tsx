import Link from "next/link";
import { Banner, Pill } from "@/components/kit";
import { TONES, type Tone } from "@/components/kit/tones";
import type { Collection } from "@/lib/terms/types";
import { cn } from "@/lib/utils";

const STUDY_LINKS: { path: string; label: string; tone: Tone }[] = [
  { path: "/app/read", label: "Read", tone: "read" },
  { path: "/app/review", label: "Review", tone: "review" },
  { path: "/app/quiz", label: "Quiz", tone: "quiz" },
];

/** Read, Review and Quiz links for the collection, or a Resume prompt while it is
 *  paused (those three leave a paused collection out). */
export function CollectionStudyRow({
  collection,
  resumePending,
  onResume,
}: {
  collection: Collection;
  resumePending: boolean;
  onResume: () => void;
}) {
  const hasTerms = collection.termCount > 0;
  return (
    <>
      {!collection.isActiveForReview ? (
        <Banner
          className="mt-3"
          action={
            <Pill variant="secondary" disabled={resumePending} onClick={onResume}>
              {resumePending ? "Resuming…" : "Resume"}
            </Pill>
          }
        >
          Paused: left out of Read, Review and Quiz.
        </Banner>
      ) : hasTerms ? (
        <nav aria-label={`Study ${collection.name}`} className="mt-3 grid grid-cols-3 gap-2">
          {STUDY_LINKS.map((link) => (
            <Link
              key={link.path}
              href={`${link.path}?collection=${collection.id}`}
              className={cn(
                "flex h-11 items-center justify-center rounded-full text-sm font-extrabold",
                TONES[link.tone].soft,
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </>
  );
}
