import { Check } from "lucide-react";
import { Pill, Tile } from "@/components/kit";
import { CAPTURE_COPY } from "@/lib/capture/copy";

export function CaptureSaved({
  term,
  unfinished,
  collectionName,
  collectionId,
  onAddAnother,
}: {
  term: string;
  unfinished: boolean;
  collectionName: string;
  collectionId: string;
  onAddAnother: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 pt-2">
      <Tile tone="success" size={48}>
        <Check className="size-6" aria-hidden strokeWidth={2.6} />
      </Tile>
      <p className="m-0 text-[15px] font-semibold text-ink-soft" role="status">
        {unfinished
          ? CAPTURE_COPY.savedUnfinished(term, collectionName)
          : CAPTURE_COPY.saved(term, collectionName)}
      </p>
      <div className="flex flex-col gap-2">
        <Pill size="lg" onClick={onAddAnother}>
          {CAPTURE_COPY.addAnother}
        </Pill>
        <Pill size="lg" variant="secondary" href={`/app/library?collection=${collectionId}`}>
          {CAPTURE_COPY.openCollection}
        </Pill>
      </div>
    </div>
  );
}
