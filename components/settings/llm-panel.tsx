"use client";

import { TopUpButton } from "@/components/ai-credits/top-up-button";
import { ProgressBar } from "@/components/kit";
import { SettingsPanel, SettingsRow, SettingsStack } from "@/components/settings/ui";
import { refillLines } from "@/lib/ai-credits/explainer";
import { freeCreditsLine } from "@/lib/ai-credits/topup-copy";
import type { CreditSchedule, TopUpState } from "@/lib/ai-credits/types";
import type { AiAccessView } from "@/lib/llm/types";

function FreeCreditsRow({ topUp }: { topUp: TopUpState | undefined }) {
  const copy = freeCreditsLine(topUp);
  if (!copy) return null;

  return (
    <SettingsRow title="Free credits" description={copy}>
      {topUp?.available ? <TopUpButton amount={topUp.amount} variant="soft" /> : null}
    </SettingsRow>
  );
}

function LineList({ lines }: { lines: string[] }) {
  return (
    <ul className="m-0 list-none space-y-1 p-0">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

/** When credits refill and lapse. Hidden when there is nothing to say. */
function RefillsRow({ schedule }: { schedule: CreditSchedule | null }) {
  const lines = refillLines(schedule);
  if (lines.length === 0) return null;

  return (
    <SettingsRow title="Refills" description={<LineList lines={lines} />}>
      {null}
    </SettingsRow>
  );
}

type AiCreditsBlockProps = {
  ai: AiAccessView;
  schedule: CreditSchedule | null;
};

function AiCreditsBlock({ ai, schedule }: AiCreditsBlockProps) {
  if (ai.kind === "credits") {
    const label = `${ai.remaining} of ${ai.total} credits left`;
    return (
      <>
        <SettingsStack>
          <SettingsRow title="Balance" description={`${label}.`}>
            <ProgressBar
              className="w-full"
              value={ai.total > 0 ? ai.remaining / ai.total : 0}
              label={label}
            />
          </SettingsRow>
          <RefillsRow schedule={schedule} />
          <FreeCreditsRow topUp={ai.topUp} />
        </SettingsStack>
        <p className="m-0 text-xs leading-snug font-semibold text-muted">
          When you use AI credits, the terms, definitions and any outline you write are sent to our
          AI provider.
        </p>
      </>
    );
  }

  if (ai.reason === "exhausted") {
    return (
      <SettingsStack>
        <SettingsRow title="Balance" description="No credits left.">
          {null}
        </SettingsRow>
        <RefillsRow schedule={schedule} />
        <FreeCreditsRow topUp={ai.topUp} />
      </SettingsStack>
    );
  }

  return <p className="m-0 text-sm font-semibold text-muted">AI isn&apos;t available right now.</p>;
}

export function LlmPanel({ ai, schedule }: AiCreditsBlockProps) {
  return (
    <SettingsPanel id="ai" title="AI credits" description="Power AI quizzes and Stories.">
      <AiCreditsBlock ai={ai} schedule={schedule} />
    </SettingsPanel>
  );
}
