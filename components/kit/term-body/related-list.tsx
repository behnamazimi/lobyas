import { Link2 } from "lucide-react";
import Link from "next/link";
import type { TermLabels } from "@/lib/terms/term-labels";
import { relationshipLabel } from "@/lib/terms/relationship-label";
import type { Term } from "@/lib/terms/types";

/** Related terms as soft rows: the relationship, the term (a link when there is
 *  an address for it) and the description. */
export function RelatedList({
  term,
  labels,
  getRelationshipHref,
}: {
  term: Term;
  labels: TermLabels;
  getRelationshipHref?: (relatedTermId: string) => string | undefined;
}) {
  if (term.relationships.length === 0) return null;
  return (
    <section aria-label={labels.relatedTerms} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink-soft">
        <Link2 className="size-4 shrink-0" aria-hidden strokeWidth={2.2} />
        {labels.relatedTerms}
      </div>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {term.relationships.map((relationship) => {
          const description = relationship.description?.trim() ?? "";
          const href = getRelationshipHref?.(relationship.relatedTermId);
          const name = (
            <span className="font-extrabold text-read-text">{relationship.relatedTermName}</span>
          );
          return (
            <li key={`${relationship.id}-${relationship.direction}`}>
              {href ? (
                <Link href={href} className="block min-h-11 rounded-[14px] bg-base-200 px-3 py-2.5">
                  <RelatedText
                    label={relationshipLabel(relationship.relationshipType)}
                    name={name}
                    description={description}
                  />
                </Link>
              ) : (
                <div className="min-h-11 rounded-[14px] bg-base-200 px-3 py-2.5">
                  <RelatedText
                    label={relationshipLabel(relationship.relationshipType)}
                    name={name}
                    description={description}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RelatedText({
  label,
  name,
  description,
}: {
  label: string;
  name: React.ReactNode;
  description: string;
}) {
  return (
    <>
      <span className="block text-sm font-semibold text-muted">
        {label} {name}
      </span>
      {description ? (
        <span className="mt-0.5 block text-[15px] leading-snug font-semibold whitespace-pre-line">
          {description}
        </span>
      ) : null}
    </>
  );
}
