import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TermBlockVariant = "plain" | "quote" | "anti" | "debated";

const LABEL: Record<TermBlockVariant, string> = {
  plain: "text-ink-soft",
  quote: "text-ink-soft",
  anti: "text-wrong-text",
  debated: "text-quiz-text",
};

const TEXT: Record<TermBlockVariant, string> = {
  plain: "",
  quote: "rounded-[14px] bg-base-200 px-3.5 py-3",
  anti: "",
  debated: "rounded-[14px] bg-debated-tint px-3.5 py-3",
};

/** One field of a term: a small icon and label, then its text. `quote` and
 *  `debated` sit in a soft box; `anti` colors the label coral. */
export function TermBlockView({
  icon: Icon,
  label,
  variant = "plain",
  children,
}: {
  icon: LucideIcon;
  label: string;
  variant?: TermBlockVariant;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <div className={cn("flex items-center gap-1.5 text-[13px] font-extrabold", LABEL[variant])}>
        <Icon className="size-4 shrink-0" aria-hidden strokeWidth={2.2} />
        {label}
      </div>
      <p
        className={cn(
          "m-0 text-base leading-normal font-semibold whitespace-pre-line",
          TEXT[variant],
        )}
      >
        {children}
      </p>
    </section>
  );
}
