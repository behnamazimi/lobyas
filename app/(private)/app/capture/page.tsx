import { Suspense } from "react";
import { getImportSetupData } from "@/app/(private)/app/import/actions";
import { CaptureFlow } from "@/components/capture/capture-flow";
import { parseSharedInput } from "@/lib/capture/shared-input";

type PageProps = {
  searchParams: Promise<{ to?: string | string[]; text?: string | string[] }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CapturePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const to = first(params.to);
  const text = first(params.text);
  const setup = await getImportSetupData();

  if ("error" in setup) {
    return <p className="text-sm font-semibold text-muted">{setup.error}</p>;
  }

  const back =
    to && setup.collections.some((collection) => collection.id === to)
      ? `/app/library?collection=${to}`
      : "/app/import";

  return (
    <>
      <Suspense>
        <CaptureFlow
          collections={setup.collections}
          presetId={to ?? null}
          backHref={back}
          shared={parseSharedInput({ text })}
        />
      </Suspense>
    </>
  );
}
