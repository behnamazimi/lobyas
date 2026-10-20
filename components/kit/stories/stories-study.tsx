"use client";

import { useState } from "react";
import { RadioGroup } from "react-aria-components";
import {
  AnswerInput,
  AnswerOption,
  AnswerRadio,
  AnswerTile,
  ChoiceCards,
  QuestionCard,
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
  const [radio, setRadio] = useState("b");
  const [style, setStyle] = useState("simple");
  const [count, setCount] = useState("10");
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
                "block max-w-full font-heading font-extrabold [overflow-wrap:break-word]",
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
                  "m-0 min-w-0 font-heading font-extrabold [overflow-wrap:break-word]",
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
        note="Four grades. With 'Show when terms come back' on, each tile adds its interval. The second row shows a grade already given."
      >
        <GradeTiles onGrade={() => {}} />
        <GradeTiles className="mt-4" onGrade={() => {}} selected="good" />
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
      <Story
        title="Quiz question"
        note="Radio answers keep arrow keys and digit shortcuts; the number shows on desktop keyboards only. The tiles are the does-it-fit pair."
      >
        <QuestionCard
          label="Pick the term"
          prompt="Which term matches this definition?"
          quote="Something that stops you from making progress until it is cleared."
        />
        <RadioGroup
          aria-label="Answer choices"
          value={radio}
          onChange={setRadio}
          className="mt-4 flex flex-col gap-2.5"
        >
          <AnswerRadio value="a" shortcut={1}>
            Deadline
          </AnswerRadio>
          <AnswerRadio value="b" shortcut={2}>
            Blocker
          </AnswerRadio>
          <AnswerRadio value="c" state="correct">
            A data structure many machines can change at once without coordinating first
          </AnswerRadio>
          <AnswerRadio value="d" state="wrong">
            Retro
          </AnswerRadio>
        </RadioGroup>
        <RadioGroup aria-label="Yes or no" className="mt-4 grid grid-cols-2 gap-2.5">
          <AnswerTile value="yes" icon="yes">
            Yes
          </AnswerTile>
          <AnswerTile value="no" icon="no" state="wrong">
            No
          </AnswerTile>
        </RadioGroup>
        <QuestionCard
          className="mt-4"
          label="Type it"
          prompt="Type the word or phrase that means this."
          quote="thank you"
          quoteStyle="word"
        />
        <div className="mt-3 flex flex-col gap-2">
          <AnswerInput aria-label="Typed answer" placeholder="Type here" />
          <AnswerInput aria-label="Correct" state="correct" defaultValue="dank je" readOnly />
          <AnswerInput aria-label="Wrong" state="wrong" defaultValue="dank" readOnly />
          <AnswerInput aria-label="Skipped" state="skipped" readOnly />
        </div>
      </Story>
      <Story
        title="Choice cards"
        note="Cards with a note for the question style; pills for the count."
      >
        <ChoiceCards
          label="Question style"
          tone="quiz"
          value={style}
          onChange={setStyle}
          options={[
            {
              value: "simple",
              label: "Simple",
              note: "Built from your definitions and examples.",
            },
            {
              value: "ai",
              label: "AI",
              note: "Fresh questions written for you. Uses credits.",
            },
          ]}
        />
        <ChoiceCards
          className="mt-3"
          label="How many questions"
          tone="quiz"
          columns={4}
          value={count}
          onChange={setCount}
          options={[
            { value: "5", label: "5" },
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "custom", label: "Custom" },
          ]}
        />
      </Story>
    </>
  );
}
