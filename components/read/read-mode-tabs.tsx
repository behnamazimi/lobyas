"use client";

import { ModeSwitch } from "@/components/kit";

// Cards passes view=cards so an unread story doesn't redirect it back to Stories.
const STORIES_PATH = "/app/read/stories";

export function isStoriesPath(pathname: string) {
  return pathname.startsWith(STORIES_PATH);
}

function withCollection(path: string, params: Record<string, string>, collection: string | null) {
  const query = new URLSearchParams(params);
  if (collection && collection !== "all") query.set("collection", collection);
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

/** Cards ↔ Stories switch at the top of Read. Carries the collection across
 *  so switching modes keeps you in the same context. */
export function ReadModeSwitch({
  pathname,
  collection,
}: {
  pathname: string;
  collection: string | null;
}) {
  const onStories = isStoriesPath(pathname);
  return (
    <ModeSwitch
      label="Read mode"
      data-tour="read-modes"
      items={[
        {
          href: withCollection("/app/read", { view: "cards" }, collection),
          label: "Cards",
          active: !onStories,
        },
        { href: withCollection(STORIES_PATH, {}, collection), label: "Stories", active: onStories },
      ]}
    />
  );
}
