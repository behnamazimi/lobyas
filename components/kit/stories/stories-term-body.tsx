"use client";

import { TermBody } from "@/components/kit";
import { Card } from "@/components/kit";
import { Story } from "./story";
import {
  DEFINITION_ONLY_TERM,
  DUTCH_TERM,
  FULL_TERM,
  JAPANESE_TERM,
  LONG_TERM,
  MORE_PLACEMENT,
} from "./fixtures";

const customize = (
  <button type="button" className="min-h-11 text-sm font-extrabold text-ink-soft">
    Customize
  </button>
);

export function TermBodyStories() {
  return (
    <>
      <Story title="Term body, every field">
        <Card className="p-5">
          <TermBody term={FULL_TERM} getRelationshipHref={(id) => `#${id}`} />
        </Card>
      </Story>
      <Story title="Term body, only a definition">
        <Card className="p-5">
          <TermBody term={DEFINITION_ONLY_TERM} />
        </Card>
      </Story>
      <Story
        title="Term body, long term, with blocks under More"
        note="More starts collapsed and counts only the blocks that have text."
      >
        <Card className="p-5">
          <TermBody term={LONG_TERM} placement={MORE_PLACEMENT} customize={customize} />
        </Card>
      </Story>
      <Story
        title="Term body, Dutch labels and Japanese text"
        note="Each language keeps its own labels and picks its own glyphs."
      >
        <div className="flex flex-col gap-3">
          <Card className="p-5">
            <TermBody term={DUTCH_TERM} language="nl" />
          </Card>
          <Card className="p-5">
            <TermBody term={JAPANESE_TERM} language="ja" />
          </Card>
        </div>
      </Story>
    </>
  );
}
