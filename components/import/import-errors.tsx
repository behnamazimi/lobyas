import { ErrorAlert } from "@/components/shared/error-alert";
import type { ImportFailure } from "@/lib/import/types";

export function ImportFailurePanel({ failure }: { failure: ImportFailure }) {
  return <ErrorAlert error={failure} className="rounded-2xl" />;
}
