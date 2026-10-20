import { notFound } from "next/navigation";
import { Banner, Card, PageHeader, PinnedAction, Pill } from "@/components/kit";
import { APP_GUIDES, findGuide } from "@/lib/import/guides";
import { withDirection } from "@/components/shared/view-transitions";

type PageProps = {
  params: Promise<{ app: string }>;
};

export function generateStaticParams() {
  return APP_GUIDES.map((guide) => ({ app: guide.slug }));
}

async function AppGuidePage({ params }: PageProps) {
  const { app } = await params;
  const guide = findGuide(app);
  if (!guide) notFound();

  const steps = guide.canExport ? [...guide.steps, "Come back here and paste."] : [];

  return (
    <>
      <PageHeader title={`From ${guide.name}`} backHref="/app/import/apps" />
      {steps.length > 0 ? (
        <Card radius="md" className="px-4 py-2">
          <ol className="m-0 flex list-none flex-col p-0">
            {steps.map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-[1.75rem_1fr] gap-3 border-b border-line py-3 text-[15px] font-semibold last:border-b-0"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-read-tint text-xs font-extrabold text-read-text">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}
      {guide.note ? <Banner>{guide.note}</Banner> : null}
      <PinnedAction className="flex flex-col gap-2">
        <Pill size="lg" href="/app/import/paste">
          {guide.canExport ? `Paste from ${guide.name}` : "Paste a list"}
        </Pill>
        {!guide.canExport ? (
          <Pill variant="secondary" size="lg" href="/app/browse">
            Browse collections
          </Pill>
        ) : null}
        {guide.link ? (
          <Pill variant="ghost" href={guide.link.href}>
            {guide.link.label}
          </Pill>
        ) : null}
      </PinnedAction>
    </>
  );
}

export default withDirection(AppGuidePage);
