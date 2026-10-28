import { PageBadge } from "@/components/illustrations/scenes/page-badge";
import type { ReactNode } from "react";
import { MASK } from "@/lib/quiz/text/mask";
import { cn } from "@/lib/utils";

/** A term quoted in the prompt (“Blocker”) stays in full ink, since it is what the question is about. */
function emphasizeQuoted(prompt: ReactNode): ReactNode {
  if (typeof prompt !== "string") return prompt;
  return prompt.split(/(“[^”]+”)/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="font-extrabold text-base-content">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** The blank in a fill-the-blank sentence, drawn as a line instead of underscores. */
function withBlanks(quote: string): ReactNode {
  return quote
    .split(MASK)
    .flatMap((part, i) =>
      i === 0
        ? [part]
        : [
            <span
              key={i}
              role="img"
              aria-label="blank"
              className="inline-block w-20 -translate-y-1 border-b-[3px] border-quiz-text"
            />,
            part,
          ],
    );
}

/** The card a quiz question sits on: the quiz badge beside the prompt, then the
 *  thing to answer about in a box. `children` sit under the box, for example Play. */
export function QuestionCard({
  prompt,
  quote,
  className,
  children,
}: {
  prompt: ReactNode;
  quote?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] bg-base-100 px-5 pt-[18px] pb-5 shadow-[0_1px_2px_rgb(var(--shadow-rgb)/0.05),0_16px_32px_-20px_rgb(var(--shadow-rgb)/0.3)]",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <PageBadge page="quiz" className="size-6 shrink-0" />
        <h2 className="m-0 font-sans text-base leading-[1.4] font-bold text-ink-soft [overflow-wrap:anywhere]">
          {emphasizeQuoted(prompt)}
        </h2>
      </div>
      {quote ? (
        <blockquote className="m-0 mt-3 rounded-[18px] bg-base-200 px-4 py-3.5 text-lg leading-[1.45] font-bold text-base-content [overflow-wrap:anywhere]">
          {withBlanks(quote)}
        </blockquote>
      ) : null}
      {children}
    </section>
  );
}
