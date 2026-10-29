"use client";

import { useEffect, useState } from "react";
import { EmptyBoxScene } from "@/components/illustrations/scenes/empty-box";
import { PreparingScene } from "@/components/illustrations/scenes/preparing";
import { EmptyPanel, FeedbackNote, Pill } from "@/components/kit";
import { StoryReader } from "@/components/read/stories/story-reader";
import { StorySetupPanel } from "@/components/read/stories/story-setup-panel";
import { useStorySession, type StorySession } from "@/components/read/stories/use-story-session";
import { StudyNoActiveCollectionsState } from "@/components/read/study/study-paused-state";
import { GENERATING_STAGES } from "@/lib/stories/generating-stages";
import { STORY_MIN_TERMS } from "@/lib/stories/types";
import type { StoriesSetupData } from "@/lib/stories/setup";

const CARDS_HREF = "/app/read?view=cards";

function StoriesNoTerms() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center py-6">
      <EmptyPanel
        illustration={<EmptyBoxScene className="w-full" />}
        title="Not enough terms to read"
        description={`Stories need a collection with at least ${STORY_MIN_TERMS} terms you haven't marked known.`}
        actions={
          <>
            <Pill variant="secondary" href="/app/library">
              Go to library
            </Pill>
            <Pill variant="soft" href={CARDS_HREF}>
              Read cards instead
            </Pill>
          </>
        }
      />
    </div>
  );
}

function useGeneratingStage() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timers = GENERATING_STAGES.slice(1).map((stage, offset) =>
      setTimeout(() => setIndex(offset + 1), stage.startsAtSeconds * 1000),
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return GENERATING_STAGES[index]!.text;
}

function StoriesGeneratingStep() {
  const stage = useGeneratingStage();
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center py-6">
      <EmptyPanel
        illustration={<PreparingScene className="w-full" />}
        title={stage}
        description="This usually takes a few seconds."
      />
    </div>
  );
}

function StoriesErrorStep({ session }: { session: StorySession }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-4">
      <FeedbackNote kind="wrong" title="Story didn't come through">
        {session.errorMessage ?? "Couldn't write a story. Try again."} Nothing was saved to your
        progress.
      </FeedbackNote>
      <div className="flex flex-col gap-2">
        <Pill size="lg" onClick={() => void session.generate()}>
          Try again
        </Pill>
        <Pill variant="soft" onClick={session.backToSetup}>
          Back to setup
        </Pill>
      </div>
    </div>
  );
}

export function StoriesPage({ setup }: { setup: StoriesSetupData }) {
  const session = useStorySession(setup);

  switch (session.step) {
    case "generating":
      return <StoriesGeneratingStep />;
    case "error":
      return <StoriesErrorStep session={session} />;
    case "reading":
      return session.story ? (
        <StoryReader
          key={session.story.id}
          session={session}
          story={session.story}
          terms={session.terms}
          narrationAccess={setup.narrationAccess}
          narrationHighlight={setup.narrationHighlight}
          tapToPlay={setup.tapToPlay}
          shadowingSettings={setup.shadowing}
          ai={setup.ai}
          narrationUrl={
            setup.currentStory?.story.id === session.story.id
              ? setup.currentStory.narrationUrl
              : null
          }
        />
      ) : null;
    default:
      return setup.collections.length === 0 ? (
        <StudyNoActiveCollectionsState paused={setup.paused} activity="reading stories" />
      ) : setup.initialCollectionId === null ? (
        <StoriesNoTerms />
      ) : (
        <StorySetupPanel session={session} collections={setup.collections} ai={setup.ai} />
      );
  }
}
