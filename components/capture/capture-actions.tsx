import { PinnedAction, Pill } from "@/components/kit";
import { CAPTURE_COPY } from "@/lib/capture/copy";

export function CaptureActions({
  canSave,
  isBusy,
  onSaveAnother,
}: {
  canSave: boolean;
  isBusy: boolean;
  onSaveAnother: () => void;
}) {
  return (
    <PinnedAction className="flex flex-col gap-2">
      <Pill size="lg" type="submit" disabled={!canSave}>
        {isBusy ? CAPTURE_COPY.saving : CAPTURE_COPY.save}
      </Pill>
      <Pill variant="ghost" disabled={!canSave} onClick={onSaveAnother}>
        {CAPTURE_COPY.saveAnother}
      </Pill>
    </PinnedAction>
  );
}
