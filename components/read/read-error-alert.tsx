import { FeedbackNote, Pill } from "@/components/kit";

export function ReadErrorAlert({
  message,
  isPending,
  onRetry,
}: {
  message: string;
  isPending: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <FeedbackNote kind="wrong" title="Couldn't load terms">
        {message}
      </FeedbackNote>
      <Pill size="lg" onClick={onRetry} disabled={isPending}>
        {isPending ? "Loading…" : "Try again"}
      </Pill>
    </div>
  );
}
