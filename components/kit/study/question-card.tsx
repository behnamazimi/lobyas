import { Zap } from "lucide-react";
import type { ReactNode } from "react";
import { termTitleClass } from "@/lib/kit/text";
import { cn } from "@/lib/utils";

/** The card a quiz question sits on: the purple label, the prompt and an optional quote.
 *  `quoteStyle="word"` sets the quote as a big serif word (a meaning to type from);
 *  the default is a boxed sentence. `children` sit under the quote, for example Play. */
export function QuestionCard({
  label,
  prompt,
  quote,
  quoteStyle = "box",
  className,
  children,
}: {
  label: string;
  prompt: ReactNode;
  quote?: string;
  quoteStyle?: "box" | "word";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] bg-base-100 px-5 pt-5 pb-[22px] shadow-[0_1px_2px_rgb(var(--shadow-rgb)/0.05),0_16px_32px_-20px_rgb(var(--shadow-rgb)/0.3)]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-quiz-text">
        <Zap className="size-[15px]" strokeWidth={2.6} aria-hidden />
        {label}
      </div>
      <h2 className="m-0 mt-2 text-[21px] leading-[1.3] font-extrabold [overflow-wrap:anywhere]">
        {prompt}
      </h2>
      {children}
      {quote ? (
        quoteStyle === "word" ? (
          <p
            className={cn(
              "m-0 mt-2.5 font-heading leading-[1.1] font-extrabold [overflow-wrap:anywhere]",
              termTitleClass(quote),
            )}
          >
            {quote}
          </p>
        ) : (
          <blockquote className="m-0 mt-3 rounded-2xl bg-base-200 px-3.5 py-3 text-[17px] leading-[1.45] font-semibold text-ink-soft [overflow-wrap:anywhere]">
            {quote}
          </blockquote>
        )
      ) : null}
    </section>
  );
}
