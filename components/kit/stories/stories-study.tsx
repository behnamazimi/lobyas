"use client";

import { useState } from "react";
import {
  AnswerOption,
  FeedbackNote,
  GradeTiles,
  ListenButton,
  Pill,
  StudyCard,
  TermDefinition,
  type ListenStatus,
} from "@/components/kit";
import { termTitleClass } from "@/lib/kit/text";
import { cn } from "@/lib/utils";
import { Story } from "./story";
import { FULL_TERM, LONG_TERM } from "./fixtures";
import { TermBody } from "@/components/kit";

export function StudyStories() {
  const [listen, setListen] = useState<ListenStatus>("idle");
  const [picked, setPicked] = useState(-1);
  return (
    <>
      <Story
        title="Study card, front and back"
        note="The body scrolls inside the card; the footer stays pinned. 760 px is the desktop cap."
      >
        <div className="flex h-[420px] flex-col gap-3">
          <StudyCard
            centered
            onPress={() => {}}
            pressLabel="Blocker. Recall the meaning, then tap to reveal."
          >
            <span
              className={cn(
                "block max-w-full font-heading leading-[1.08] font-extrabold [overflow-wrap:anywhere]",
                termTitleClass("Blocker"),
              )}
            >
              Blocker
            </span>
            <span className="mt-2.5 block text-sm font-bold text-muted">Meetings</span>
          </StudyCard>
          <Pill size="lg">Show answer</Pill>
        </div>
        <div className="mt-4 flex h-[560px] flex-col gap-3">
          <StudyCard
            footer={
              <GradeTiles
                onGrade={() => {}}
                intervals={{
                  again: "10 min",
                  hard: "2 days",
                  good: "6 days",
                  easy: "3 weeks",
                }}
              />
            }
          >
            <div className="flex items-start justify-between gap-2.5">
              <h4
                className={cn(
                  "m-0 min-w-0 font-heading leading-[1.1] font-extrabold text-review-text [overflow-wrap:anywhere]",
                  termTitleClass(LONG_TERM.term, "back"),
                )}
              >
                {LONG_TERM.term}
              </h4>
              <ListenButton
                status={listen}
                onPress={() => setListen(listen === "idle" ? "playing" : "idle")}
              />
            </div>
            <TermBody term={LONG_TERM} className="mt-3.5" />
          </StudyCard>
        </div>
      </Story>
      <Story
        title="Grade tiles"
        note="Four grades. With 'Show when terms come back' on, each tile adds its interval."
      >
        <GradeTiles onGrade={() => {}} />
        <GradeTiles
          className="mt-4"
          onGrade={() => {}}
          intervals={{
            again: "10 min",
            hard: "2 days",
            good: "6 days",
            easy: "3 weeks",
          }}
        />
      </Story>
      <Story title="Answer options, feedback note, Listen button">
        <div className="flex flex-col gap-2">
          <AnswerOption
            marker="A"
            state={picked === 0 ? "picked" : "default"}
            onPress={() => setPicked(picked === 0 ? -1 : 0)}
          >
            Parking lot
          </AnswerOption>
          <AnswerOption marker="B" state="default">
            Sidebar
          </AnswerOption>
          <AnswerOption marker="C" state="correct">
            Action item that is long enough to wrap onto a second line
          </AnswerOption>
          <AnswerOption marker="D" state="wrong">
            Timebox
          </AnswerOption>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <FeedbackNote kind="correct" title="Correct">
            It stops progress until someone clears it.
          </FeedbackNote>
          <FeedbackNote kind="wrong" title="Not quite">
            The answer was “Blocker”.
          </FeedbackNote>
          <FeedbackNote kind="skipped" title="Skipped">
            We’ll bring this one back later.
          </FeedbackNote>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["idle", "loading", "playing"] as const).map((status) => (
            <ListenButton key={status} status={status} />
          ))}
        </div>
        <div className="mt-4">
          <TermDefinition term={FULL_TERM} />
        </div>
      </Story>
    </>
  );
}
