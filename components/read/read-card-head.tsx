import { TermNarrationPlayer } from "@/components/terms/term-narration-player";
import { CLAMP_TWO_LINES, termTitleClass } from "@/lib/kit/text";
import type { ReviewTerm } from "@/lib/review/types";
import { cn } from "@/lib/utils";

/** The top of a revealed Read card: category and Listen, then the term. */
export function ReadCardHead({
  term,
  narrationAccess,
  narrationPreload = false,
  className,
}: {
  term: ReviewTerm;
  narrationAccess: boolean;
  narrationPreload?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-2.5">
        <div
          className={cn(
            "mt-3 min-w-0 text-[13px] leading-snug font-bold text-muted",
            CLAMP_TWO_LINES,
          )}
        >
          {term.category}
        </div>
        {narrationAccess ? (
          <TermNarrationPlayer
            termId={term.id}
            clipVersion={term.narrationVersion}
            preload={narrationPreload}
            look="pill"
          />
        ) : null}
      </div>
      <h1
        className={cn(
          "mt-1 mb-3.5 font-heading leading-[1.08] font-extrabold [overflow-wrap:anywhere] hyphens-auto",
          termTitleClass(term.term),
        )}
      >
        {term.term}
      </h1>
    </div>
  );
}
