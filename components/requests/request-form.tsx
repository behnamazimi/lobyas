"use client";

import { track } from "@/lib/analytics/track";
import { ChevronDown } from "lucide-react";
import { useState, useTransition } from "react";
import { createRequest } from "@/app/(private)/app/import/request/actions";
import { SearchResults } from "@/components/import/chooser-search-results";
import {
  Banner,
  Chip,
  ChoiceCards,
  FormField,
  PinnedAction,
  Pill,
  TextArea,
  TextInput,
} from "@/components/kit";
import { RequestSent } from "@/components/requests/request-sent";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useBrowseSearch } from "@/hooks/use-browse-search";
import type { CollectionLanguage } from "@/lib/terms/languages";
import { REQUEST_COPY } from "@/lib/requests/copy";
import { MAX_TOPIC_LENGTH } from "@/lib/requests/schema";
import {
  REQUEST_KINDS,
  REQUEST_LEVELS,
  REQUEST_SIZES,
  type RequestKind,
  type RequestLevel,
} from "@/lib/requests/types";
import { cn } from "@/lib/utils";

const FORM = REQUEST_COPY.form;

export type RecentRequest = {
  key: string;
  topic: string;
  createdDate: string;
  sentence: string;
  collectionId: string | null;
};

type RequestFormProps = {
  initialTopic: string;
  estimateDays: number;
  paused: boolean;
  used: number;
  recent: RecentRequest[];
  ownedNames: string[];
};

const normalize = (value: string) => value.trim().toLowerCase();

/** Optional picks: tapping the chosen one again clears it. */
function Choice<T extends string | number>({
  label,
  options,
  value,
  onChange,
  render,
  isDisabled,
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T | null) => void;
  render: (option: T) => string;
  isDisabled: boolean;
}) {
  return (
    <FormField label={label}>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={String(option)}
            selected={value === option}
            onPress={() => !isDisabled && onChange(value === option ? null : option)}
          >
            {render(option)}
          </Chip>
        ))}
      </div>
    </FormField>
  );
}

export function RequestForm({
  initialTopic,
  estimateDays,
  paused,
  used,
  recent,
  ownedNames,
}: RequestFormProps) {
  const browse = useBrowseSearch(initialTopic);
  const topic = browse.query;
  const [kind, setKind] = useState<RequestKind>("jargon");
  const [language, setLanguage] = useState<CollectionLanguage>("en");
  const [level, setLevel] = useState<string | null>(null);
  const [size, setSize] = useState<number | null>(null);
  const [known, setKnown] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{
    id: string;
    topic: string;
    estimateDays: number;
  } | null>(null);
  const [isSending, startSending] = useTransition();

  if (sent) return <RequestSent {...sent} />;

  const key = normalize(topic);
  const repeat = key ? recent.find((request) => request.key === key) : undefined;
  const owned = key ? ownedNames.find((name) => normalize(name) === key) : undefined;
  const canSend = topic.trim().length >= 3 && !isSending;

  function send() {
    setError(null);
    startSending(async () => {
      const result = await createRequest({
        topic,
        kind,
        language,
        level: level ?? undefined,
        size: size ?? undefined,
        knownTerms: known,
        notifyEmail: true,
      });
      if (result.ok) {
        track("collection_request_submitted", {
          kind,
          language,
          requested_size: size,
        });
        setSent(result);
      } else setError(result.message);
    });
  }

  return (
    <form
      className="flex flex-1 flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) send();
      }}
    >
      <p className="m-0 text-sm font-semibold text-muted">{FORM.quota(used)}</p>
      {paused ? <Banner>{FORM.paused(estimateDays)}</Banner> : null}

      <FormField label={FORM.topicLabel} htmlFor="request-topic">
        <TextInput
          id="request-topic"
          value={topic}
          maxLength={MAX_TOPIC_LENGTH + 20}
          disabled={isSending}
          placeholder={FORM.topicPlaceholder}
          onChange={(event) => browse.handleQuery(event.target.value)}
        />
      </FormField>

      {repeat ? (
        <Banner
          action={
            repeat.collectionId ? (
              <Pill variant="secondary" href={`/app/library?collection=${repeat.collectionId}`}>
                {FORM.openIt}
              </Pill>
            ) : undefined
          }
        >
          {FORM.repeatTopic(repeat.topic, repeat.createdDate, repeat.sentence)}
        </Banner>
      ) : null}
      {owned ? (
        <p className="m-0 text-sm font-semibold text-muted" role="status">
          {FORM.existingName(owned)}
        </p>
      ) : null}

      {browse.search.status === "done" && browse.search.collections.length > 0 ? (
        <p className="m-0 text-sm font-extrabold">{FORM.closeMatches}</p>
      ) : null}
      <SearchResults
        state={browse.search}
        addingId={browse.addingId}
        addedIds={browse.addedIds}
        onAdd={(id) => void browse.add(id)}
        hideWhenEmpty
      />

      <FormField label={FORM.kindLabel}>
        <ChoiceCards
          label={FORM.kindLabel}
          options={REQUEST_KINDS.map((option) => ({
            value: option,
            label: FORM.kinds[option],
          }))}
          value={kind}
          onChange={(next) => {
            if (isSending) return;
            setKind(next as RequestKind);
            setLevel(null);
          }}
        />
      </FormField>

      <FormField label={FORM.languageLabel}>
        <LanguageToggle value={language} onChange={setLanguage} isDisabled={isSending} />
      </FormField>

      <Collapsible isExpanded={detailsOpen} onExpandedChange={setDetailsOpen}>
        <CollapsibleTrigger className="flex min-h-12 w-full items-center justify-between text-left text-[15px] font-extrabold">
          {FORM.detailsToggle}
          <ChevronDown
            className={cn("size-4 transition-transform", detailsOpen && "rotate-180")}
            aria-hidden
            strokeWidth={2.6}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 pt-2">
            <Choice
              label={FORM.levelLabel}
              options={REQUEST_LEVELS[kind] as readonly string[]}
              value={level}
              isDisabled={isSending}
              render={(option) => FORM.levels[option as RequestLevel]}
              onChange={setLevel}
            />
            <Choice
              label={FORM.sizeLabel}
              options={REQUEST_SIZES}
              value={size}
              isDisabled={isSending}
              render={FORM.size}
              onChange={setSize}
            />
            <FormField label={FORM.knownLabel} htmlFor="request-known">
              <TextArea
                id="request-known"
                value={known}
                rows={4}
                disabled={isSending}
                onChange={(event) => setKnown(event.target.value)}
              />
              <p className="m-0 text-[13px] font-semibold text-muted">{FORM.knownHelp}</p>
            </FormField>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <p className="m-0 text-[13px] font-semibold text-muted">{FORM.privacy}</p>

      {error ? (
        <p className="m-0 text-sm font-bold text-wrong-text" role="alert">
          {error}
        </p>
      ) : null}

      <PinnedAction>
        <Pill size="lg" type="submit" disabled={!canSend}>
          {isSending ? FORM.sending : FORM.submit}
        </Pill>
        <p className="m-0 mt-2 text-center text-[13px] font-semibold text-muted">
          {FORM.eta(estimateDays)}
        </p>
      </PinnedAction>
    </form>
  );
}
