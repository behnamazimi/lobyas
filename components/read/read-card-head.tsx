import { TermNarrationPlayer } from "@/components/terms/term-narration-player";
import { CLAMP_TWO_LINES, termTitleClass } from "@/lib/kit/text";
import type { ReviewTerm } from "@/lib/review/types";
import { cn } from "@/lib/utils";

/** The top of a revealed Read card, laid out like Review's: the term with its
 *  category under it, and Listen on the right. */
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
    <div className={cn("mb-3.5 flex items-start justify-between gap-2.5", className)}>
      <div className="min-w-0">
        <h1
          className={cn(
            "m-0 font-heading font-extrabold [overflow-wrap:break-word]",
            termTitleClass(term.term, "back"),
          )}
        >
          {term.term}
        </h1>
        {term.category ? (
          <div
            className={cn("mt-1 text-[13px] leading-snug font-bold text-muted", CLAMP_TWO_LINES)}
          >
            {term.category}
          </div>
        ) : null}
      </div>
      {narrationAccess ? (
        <TermNarrationPlayer
          termId={term.id}
          clipUrl={term.narrationUrl}
          preload={narrationPreload}
          look="pill"
        />
      ) : null}
    </div>
  );
}
