import {
  BookmarkMinus,
  Download,
  Flag,
  Heart,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { ListRow } from "@/components/kit";
import { REPORTED_THANKS } from "@/lib/collections/moderation";
import type { Collection } from "@/lib/terms/types";
import { pluralize } from "@/lib/utils";

type CollectionActionRowsProps = {
  collection: Collection;
  disabled: boolean;
  reportedByMe: boolean;
  /** Wraps a handler so the sheet closes before it runs. */
  pick: (action: () => void) => () => void;
  onToggleLove: () => void;
  onEdit: () => void;
  onToggleActiveForReview: () => void;
  onExport: () => void;
  onReset: () => void;
  onDelete: () => void;
  onReport: () => void;
  onRemove: () => void;
};

/** The rows of a collection's More sheet. Owners get Edit and Delete; a collection
 *  added from Browse gets Love, Report and Remove. */
export function CollectionActionRows({
  collection,
  disabled,
  reportedByMe,
  pick,
  onToggleLove,
  onEdit,
  onToggleActiveForReview,
  onExport,
  onReset,
  onDelete,
  onReport,
  onRemove,
}: CollectionActionRowsProps) {
  const owned = collection.source === "owned";
  return (
    <>
      {!owned ? (
        <ListRow
          icon={<Heart className="size-5" aria-hidden />}
          tone={collection.lovedByMe ? "wrong" : "neutral"}
          label={collection.lovedByMe ? "Loved" : "Love this collection"}
          subline={`Loved by ${pluralize(collection.loveCount, "person", "people")}`}
          onPress={pick(onToggleLove)}
        />
      ) : null}
      {owned ? (
        <ListRow
          icon={<Pencil className="size-5" aria-hidden />}
          label="Edit collection"
          subline="Name, what it teaches, language, description"
          onPress={pick(onEdit)}
          disabled={disabled}
        />
      ) : null}
      <ListRow
        icon={
          collection.isActiveForReview ? (
            <Pause className="size-5" aria-hidden />
          ) : (
            <Play className="size-5" aria-hidden />
          )
        }
        label={collection.isActiveForReview ? "Pause review" : "Resume review"}
        subline={
          collection.isActiveForReview
            ? "Keeps every term, takes it out of study until you resume"
            : "Puts it back into Read, Review and Quiz"
        }
        onPress={pick(onToggleActiveForReview)}
        disabled={disabled}
      />
      <ListRow
        icon={<Download className="size-5" aria-hidden />}
        label="Export JSON"
        subline="Copy or download every term and field"
        onPress={pick(onExport)}
        disabled={disabled}
      />
      <ListRow
        danger
        icon={<RotateCcw className="size-5" aria-hidden />}
        label="Reset progress"
        subline="Start every term from scratch"
        onPress={pick(onReset)}
        disabled={disabled || collection.knownCount === 0}
      />
      {owned ? (
        <ListRow
          danger
          icon={<Trash2 className="size-5" aria-hidden />}
          label="Delete collection"
          subline="Removes it and all its progress"
          onPress={pick(onDelete)}
          disabled={disabled}
        />
      ) : (
        <>
          {collection.isBuiltin ? null : (
            <ListRow
              icon={<Flag className="size-5" aria-hidden />}
              label={reportedByMe ? REPORTED_THANKS : "Report collection"}
              subline={reportedByMe ? undefined : "Tell us what's wrong with it"}
              onPress={pick(onReport)}
              disabled={disabled || reportedByMe}
            />
          )}
          <ListRow
            danger
            icon={<BookmarkMinus className="size-5" aria-hidden />}
            label="Remove from library"
            subline="Your progress stays if you add it again"
            onPress={pick(onRemove)}
            disabled={disabled}
          />
        </>
      )}
    </>
  );
}
