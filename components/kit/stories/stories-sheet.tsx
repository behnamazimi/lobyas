"use client";

import { useState } from "react";
import { BottomSheet, ConfirmDialog, Pill } from "@/components/kit";
import { Story } from "./story";

export function SheetStories() {
  const [open, setOpen] = useState(false);
  const [heroOpen, setHeroOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <>
      <Story
        single
        title="Sheet"
        note="A bottom sheet under 768 px, a centered dialog from there up. The sheet opens over the whole page, in the page's theme."
      >
        <Pill variant="secondary" onClick={() => setOpen(true)}>
          Open sheet
        </Pill>
        <BottomSheet
          isOpen={open}
          onOpenChange={setOpen}
          title="Blocker"
          subline="Meetings · Standup"
          footer={
            <Pill size="lg" onClick={() => setOpen(false)}>
              Done
            </Pill>
          }
        >
          {Array.from({ length: 14 }, (_, index) => (
            <p key={index} className="mt-0 mb-3 text-base font-semibold">
              The body scrolls while the handle, title and footer stay put. Line {index + 1}.
            </p>
          ))}
        </BottomSheet>
      </Story>
      <Story
        single
        title="Sheet with hero"
        note="For a celebration: art across the top in place of the handle, a centered title, a full-height sheet on a phone."
      >
        <Pill variant="secondary" onClick={() => setHeroOpen(true)}>
          Open celebration
        </Pill>
        <BottomSheet
          full
          isOpen={heroOpen}
          onOpenChange={setHeroOpen}
          title="Review goal met!"
          subline="That's your pace for today."
          hero={<div className="h-40 bg-warning" />}
          footer={
            <Pill size="lg" onClick={() => setHeroOpen(false)}>
              Finish for today
            </Pill>
          }
        >
          <p className="m-0 text-center text-base font-semibold">Body</p>
        </BottomSheet>
      </Story>
      <Story
        single
        title="Confirm dialog"
        note="A centered alert dialog for something that can't be undone. While busy it can't be dismissed."
      >
        <Pill variant="danger" onClick={() => setConfirmOpen(true)}>
          Delete term
        </Pill>
        <ConfirmDialog
          isOpen={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete term?"
          confirmLabel="Delete"
          onConfirm={() => setConfirmOpen(false)}
        >
          “Blocker” and its progress will be removed from Standup. This can’t be undone.
        </ConfirmDialog>
      </Story>
    </>
  );
}
