import { CaughtUpScene } from "@/components/illustrations/scenes/caught-up";
import { EmptyPanel, Pill, StatTile } from "@/components/kit";

type TriageSummaryProps = {
  collectionId: string;
  collectionName: string;
  markedCount: number;
  leftToLearnCount: number;
  hasNotYet: boolean;
  onRevisitNotYet: () => void;
};

export function TriageNextSteps({
  collectionId,
  hasNotYet,
  onRevisitNotYet,
}: Pick<TriageSummaryProps, "collectionId" | "hasNotYet" | "onRevisitNotYet">) {
  return (
    <>
      <Pill href={`/app/read?collection=${collectionId}`}>Start reading</Pill>
      <Pill href={`/app/library?collection=${collectionId}`} variant="secondary">
        Back to library
      </Pill>
      {hasNotYet ? (
        <Pill variant="secondary" onClick={onRevisitNotYet}>
          Go through &ldquo;Not yet&rdquo; again
        </Pill>
      ) : null}
    </>
  );
}

/** End of the deck: how it went, and where to go next. */
export function TriageSummary({
  collectionId,
  collectionName,
  markedCount,
  leftToLearnCount,
  hasNotYet,
  onRevisitNotYet,
}: TriageSummaryProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 py-4">
      <EmptyPanel
        illustration={<CaughtUpScene className="w-full" />}
        title="All sorted"
        description={`You went through every term in ${collectionName}.`}
      />
      <div className="grid w-full max-w-sm grid-cols-2 gap-2 px-5">
        <StatTile tone="success" value={markedCount} label="Marked known" />
        <StatTile value={leftToLearnCount} label="Left to learn" />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-2 px-5">
        <TriageNextSteps
          collectionId={collectionId}
          hasNotYet={hasNotYet}
          onRevisitNotYet={onRevisitNotYet}
        />
      </div>
    </div>
  );
}
