import { Chip } from "@/components/kit";
import { CAPTURE_COPY } from "@/lib/capture/copy";
import type { Selection } from "@/lib/capture/selection";
import type { Token } from "@/lib/capture/tokenize";

export function SharedSentenceChips({
  tokens,
  selection,
  term,
  onToggle,
}: {
  tokens: Token[];
  selection: Selection;
  term: string;
  onToggle: (index: number) => void;
}) {
  return (
    <section className="flex flex-col gap-2" aria-label={CAPTURE_COPY.sharedHint}>
      <p className="m-0 text-sm font-semibold text-muted" role="status">
        {term ? CAPTURE_COPY.pickedWords(term) : CAPTURE_COPY.pickWords}
      </p>
      <div className="flex flex-wrap gap-2">
        {tokens.map((token, index) => (
          <Chip
            key={token.start}
            selected={selection !== null && index >= selection.start && index <= selection.end}
            onPress={() => onToggle(index)}
          >
            {token.text}
          </Chip>
        ))}
      </div>
    </section>
  );
}
