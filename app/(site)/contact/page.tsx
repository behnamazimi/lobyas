import type { Metadata } from "next";
import { PageBadge } from "@/components/illustrations/scenes/page-badge";
import { ContentPageHeader, ContentPageShell } from "@/components/content/content-page-shell";
import { LinkButton } from "@/components/ui/button";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Lobyas with a question, a problem or an idea.",
};

export default function ContactPageRoute() {
  return (
    <ContentPageShell>
      <ContentPageHeader
        badge={<PageBadge page="contact" />}
        title="Contact"
        description="Questions, problems and ideas are all welcome."
      />
      <div className="mt-10 space-y-4 text-sm text-base-content/80">
        <p className="m-0">Email us and a person will read it.</p>
        <LinkButton href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</LinkButton>
        <p className="m-0 text-base-content/70">
          Already have an account? Use Report an issue in your account menu to send a problem or an
          idea with a screenshot.
        </p>
      </div>
    </ContentPageShell>
  );
}
