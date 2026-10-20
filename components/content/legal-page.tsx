import { PageBadge } from "@/components/illustrations/scenes/page-badge";
import type { ReactNode } from "react";
import { ContentPageHeader, ContentPageShell } from "@/components/content/content-page-shell";

type LegalPageProps = {
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({ title, description, updated, children }: LegalPageProps) {
  return (
    <ContentPageShell>
      <ContentPageHeader
        badge={<PageBadge page="legal" />}
        title={title}
        description={description}
      />
      <p className="mt-3 mb-0 text-xs text-base-content/60">Last updated {updated}</p>
      <article className="mt-10">{children}</article>
    </ContentPageShell>
  );
}
