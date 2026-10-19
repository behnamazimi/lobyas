import { Ban, Lightbulb, MessagesSquare, Quote, Search, Signpost, StickyNote } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { definitionClass } from "@/lib/kit/text";
import type { CollectionLanguage } from "@/lib/terms/languages";
import { TERM_LABELS, type TermLabels } from "@/lib/terms/term-labels";
import { moreCount, TERM_BLOCKS, type Placement, type TermBlock } from "@/lib/terms/term-layout";
import type { Term } from "@/lib/terms/types";
import { cn } from "@/lib/utils";
import { MoreFooter } from "./more-footer";
import { RelatedList } from "./related-list";
import { TermBlockView } from "./term-block";

export type TermBodyProps = {
  term: Term;
  className?: string;
  showSearchLink?: boolean;
  language?: CollectionLanguage;
  getRelationshipHref?: (relatedTermId: string) => string | undefined;
  /** Which blocks sit under "More". Without it every block is shown. */
  placement?: Placement;
  /** The quiet button beside "More" that opens the layout editor. */
  customize?: ReactNode;
};

type TextBlock = Exclude<TermBlock, "relationships" | "searchLink">;

const TEXT_BLOCKS: Record<
  TextBlock,
  {
    field: keyof Pick<
      Term,
      "mentalModel" | "example" | "antiExample" | "discussion" | "controversy" | "note"
    >;
    label: keyof Pick<
      TermLabels,
      "mentalModel" | "example" | "antiExample" | "discussion" | "controversy" | "note"
    >;
    icon: typeof Lightbulb;
    variant: "plain" | "quote" | "anti" | "debated";
  }
> = {
  mentalModel: {
    field: "mentalModel",
    label: "mentalModel",
    icon: Lightbulb,
    variant: "plain",
  },
  example: {
    field: "example",
    label: "example",
    icon: Quote,
    variant: "quote",
  },
  antiExample: {
    field: "antiExample",
    label: "antiExample",
    icon: Ban,
    variant: "anti",
  },
  discussion: {
    field: "discussion",
    label: "discussion",
    icon: Signpost,
    variant: "plain",
  },
  controversy: {
    field: "controversy",
    label: "controversy",
    icon: MessagesSquare,
    variant: "debated",
  },
  note: { field: "note", label: "note", icon: StickyNote, variant: "plain" },
};

function textBlock(term: Term, labels: TermLabels, block: TextBlock): ReactNode {
  const spec = TEXT_BLOCKS[block];
  const text = term[spec.field]?.trim();
  if (!text) return null;
  return (
    <TermBlockView icon={spec.icon} label={labels[spec.label]} variant={spec.variant}>
      {text}
    </TermBlockView>
  );
}

function SearchLink({ term, labels }: { term: Term; labels: TermLabels }) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${term.term} definition`,
  )}`;
  return (
    <a
      className="flex min-h-11 items-center gap-1.5 text-sm font-extrabold text-read-text no-underline"
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Search className="size-4 shrink-0" aria-hidden strokeWidth={2.4} />
      {labels.searchOnGoogle(term.term)}
    </a>
  );
}

export function TermDefinition({ term }: { term: Pick<Term, "definition"> }) {
  return (
    <p
      className={cn(
        "m-0 leading-[1.4] font-bold whitespace-pre-line",
        definitionClass(term.definition),
      )}
    >
      {term.definition}
    </p>
  );
}

/** Every field a term has, in today's order and with the collection language's
 *  labels: the definition, then each block that has text, related terms and the
 *  search link. With a `placement`, blocks moved under More sit behind a footer. */
export function TermBody({
  term,
  className,
  showSearchLink = true,
  language = "en",
  getRelationshipHref,
  placement,
  customize,
}: TermBodyProps) {
  const labels = TERM_LABELS[language];
  const blocks: Record<TermBlock, ReactNode> = {
    mentalModel: textBlock(term, labels, "mentalModel"),
    example: textBlock(term, labels, "example"),
    antiExample: textBlock(term, labels, "antiExample"),
    discussion: textBlock(term, labels, "discussion"),
    controversy: textBlock(term, labels, "controversy"),
    note: textBlock(term, labels, "note"),
    relationships: (
      <RelatedList term={term} labels={labels} getRelationshipHref={getRelationshipHref} />
    ),
    searchLink: showSearchLink ? <SearchLink term={term} labels={labels} /> : null,
  };
  const inPlace = (where: "shown" | "more") =>
    TERM_BLOCKS.filter((block) => (placement?.[block] ?? "shown") === where).map((block) => (
      <Fragment key={block}>{blocks[block]}</Fragment>
    ));

  return (
    <div
      lang={language}
      className={cn("flex flex-col gap-4 text-start [overflow-wrap:break-word]", className)}
    >
      <TermDefinition term={term} />

      {inPlace("shown")}

      {placement ? (
        <MoreFooter count={moreCount(placement, term, showSearchLink)} customize={customize}>
          {inPlace("more")}
        </MoreFooter>
      ) : null}
    </div>
  );
}
