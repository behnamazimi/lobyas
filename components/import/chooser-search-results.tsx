"use client";

import { Card, Divider, Pill, Tile } from "@/components/kit";
import type { SharedCollection } from "@/lib/terms/types";
import { pluralize } from "@/lib/utils";

export type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; query: string; collections: SharedCollection[] };

const NOTE = "m-0 text-sm font-semibold text-muted";

function subline(collection: SharedCollection) {
  const parts = [
    collection.isBuiltin ? "Built-in" : "Community",
    pluralize(collection.termCount, "term"),
  ];
  if (!collection.isBuiltin && collection.loveCount > 0) {
    parts.push(pluralize(collection.loveCount, "love"));
  }
  return parts.join(" · ");
}

export function SearchResults({
  state,
  addingId,
  addedIds,
  onAdd,
  hideWhenEmpty = false,
  noMatchMessage,
}: {
  state: SearchState;
  addingId: string | null;
  addedIds: string[];
  onAdd: (collectionId: string) => void;
  /** The request form shows close matches only when there are some. */
  hideWhenEmpty?: boolean;
  noMatchMessage?: (query: string) => string;
}) {
  if (state.status === "idle") return null;
  if (state.status === "loading") return <p className={NOTE}>Searching…</p>;
  if (state.status === "error") {
    return (
      <p className="m-0 text-sm font-bold text-wrong-text" role="alert">
        Couldn&apos;t search right now. Try again.
      </p>
    );
  }
  if (state.collections.length === 0) {
    if (hideWhenEmpty) return null;
    return (
      <p className={NOTE} role="status">
        {noMatchMessage
          ? noMatchMessage(state.query)
          : `No built-in or community collection matches “${state.query}”. Try a list, or start an empty collection.`}
      </p>
    );
  }

  return (
    <Card radius="md" className="px-3.5 py-1">
      <ul className="m-0 list-none p-0">
        {state.collections.map((collection, index) => {
          const added = collection.inCollection || addedIds.includes(collection.id);
          return (
            <li key={collection.id}>
              {index > 0 ? <Divider /> : null}
              <div className="flex min-h-16 items-center gap-3 py-2">
                <Tile tone={collection.isBuiltin ? "success" : "read"} serif>
                  {collection.name.charAt(0).toUpperCase()}
                </Tile>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[15px] font-extrabold">{collection.name}</p>
                  <p className="m-0 text-[13px] font-semibold text-muted">{subline(collection)}</p>
                </div>
                {added ? (
                  <Pill
                    variant="soft"
                    href={`/app/library?collection=${collection.id}`}
                    className="shrink-0"
                  >
                    Added · Open
                  </Pill>
                ) : (
                  <Pill
                    className="shrink-0"
                    disabled={addingId === collection.id}
                    onClick={() => onAdd(collection.id)}
                  >
                    {addingId === collection.id ? "Adding…" : "Add"}
                  </Pill>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
