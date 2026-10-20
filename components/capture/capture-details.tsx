import { ChevronDown } from "lucide-react";
import type { CaptureTerm } from "@/app/(private)/app/capture/actions";
import { CategoryField, OptionalDetailFields } from "@/components/terms/term-form-fields";
import { TermRelationshipsEditor } from "@/components/terms/term-relationships-editor";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CAPTURE_COPY } from "@/lib/capture/copy";
import type { RelationshipDraft } from "@/lib/terms/relationship-schema";
import type { TermFormValues } from "@/lib/terms/term-schema";
import { cn } from "@/lib/utils";

/** Everything beyond term and definition, tucked away until asked for. */
export function CaptureDetails({
  form,
  onFieldChange,
  open,
  onOpenChange,
  terms,
  drafts,
  onDraftsChange,
}: {
  form: TermFormValues;
  onFieldChange: <K extends keyof TermFormValues>(key: K, value: TermFormValues[K]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terms: CaptureTerm[];
  drafts: RelationshipDraft[];
  onDraftsChange: (drafts: RelationshipDraft[]) => void;
}) {
  return (
    <Collapsible isExpanded={open} onExpandedChange={onOpenChange} className="border-t border-line">
      <CollapsibleTrigger className="flex min-h-12 w-full items-center justify-between gap-2 text-left text-[15px] font-extrabold">
        <span>
          {CAPTURE_COPY.moreDetails}
          <span className="block text-[13px] font-semibold text-muted">
            {CAPTURE_COPY.moreDetailsHint}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform motion-reduce:transition-none",
            open && "rotate-180",
          )}
          aria-hidden
          strokeWidth={2.6}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 pt-2 pb-2">
          <CategoryField form={form} onFieldChange={onFieldChange} />
          <OptionalDetailFields form={form} onFieldChange={onFieldChange} />
          {terms.length > 0 ? (
            <TermRelationshipsEditor
              drafts={drafts}
              onChange={onDraftsChange}
              collectionTerms={terms}
              sourceTermId={undefined}
            />
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
