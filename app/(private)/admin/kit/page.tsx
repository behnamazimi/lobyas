import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ControlsStories } from "@/components/kit/stories/stories-controls";
import { ProgressStories } from "@/components/kit/stories/stories-progress";
import { SheetStories } from "@/components/kit/stories/stories-sheet";
import { ShellStories } from "@/components/kit/stories/stories-shell";
import { StateStories } from "@/components/kit/stories/stories-states";
import { StudyStories } from "@/components/kit/stories/stories-study";
import { SurfaceStories } from "@/components/kit/stories/stories-surfaces";
import { TermBodyStories } from "@/components/kit/stories/stories-term-body";
import { requireAdminPage } from "@/lib/admin/page-guard";

export const metadata: Metadata = { title: "Kit" };

export default async function AdminKitPage() {
  await requireAdminPage();

  return (
    <>
      <AdminPageHeader
        title="Kit"
        description="Every shared building block of the app, in the light and dim themes."
      />
      <SurfaceStories />
      <ControlsStories />
      <ProgressStories />
      <ShellStories />
      <SheetStories />
      <StudyStories />
      <TermBodyStories />
      <StateStories />
    </>
  );
}
