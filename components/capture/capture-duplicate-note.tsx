import { Banner, Pill } from "@/components/kit";
import { CAPTURE_COPY } from "@/lib/capture/copy";

export function CaptureDuplicateNote({
  term,
  finished,
  collectionName,
  collectionId,
}: {
  term: string;
  finished: boolean;
  collectionName: string;
  collectionId: string;
}) {
  return (
    <Banner
      action={
        <Pill variant="secondary" href={`/app/library?collection=${collectionId}`}>
          {CAPTURE_COPY.openIt}
        </Pill>
      }
    >
      <strong className="block font-extrabold">
        {finished
          ? CAPTURE_COPY.duplicate(term, collectionName)
          : CAPTURE_COPY.duplicateUnfinished(term, collectionName)}
      </strong>
      {CAPTURE_COPY.qualifierHint}
    </Banner>
  );
}
