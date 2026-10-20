import type { Metadata } from "next";
import { Divider, ListRow, PageHeader, SectionCard } from "@/components/kit";
import { APP_GUIDES } from "@/lib/import/guides";
import { withDirection } from "@/components/shared/view-transitions";

export const metadata: Metadata = { title: "From another app" };

function AppPickerPage() {
  return (
    <>
      <PageHeader
        title="From another app"
        subline="Pick the app. You'll see where its export is, then paste it here."
        backHref="/app/import"
      />
      <SectionCard>
        {APP_GUIDES.map((guide, index) => (
          <div key={guide.slug}>
            {index > 0 ? <Divider /> : null}
            <ListRow
              href={`/app/import/apps/${guide.slug}`}
              icon={<span className="font-heading text-lg">{guide.name.charAt(0)}</span>}
              label={guide.name}
              subline={guide.summary}
            />
          </div>
        ))}
      </SectionCard>
    </>
  );
}

export default withDirection(AppPickerPage);
