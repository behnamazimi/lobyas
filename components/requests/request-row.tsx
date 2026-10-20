import Link from "next/link";
import { NAV_FORWARD } from "@/components/shared/view-transitions";
import { REQUEST_COPY } from "@/lib/requests/copy";
import type { RequestEntry } from "@/lib/requests/entry";

const CHOOSER = REQUEST_COPY.chooser;
const NOTE = "m-0 text-sm font-semibold text-muted";

/** The last row under a search: ask for the collection that isn't there. It
 *  turns into a plain sentence when this person can't send a request right now. */
export function RequestRow({ entry, query }: { entry: RequestEntry; query: string }) {
  const trimmed = query.trim();
  if (!trimmed || entry.state === "closed") return null;

  if (entry.state === "open") {
    return (
      <p className={NOTE} role="status">
        {CHOOSER.openRequest(entry.topic)}
      </p>
    );
  }
  if (entry.state === "cap") {
    return (
      <p className={NOTE} role="status">
        {CHOOSER.capReached(entry.date)}
      </p>
    );
  }

  return (
    <div>
      <Link
        href={`/app/import/request?topic=${encodeURIComponent(trimmed.slice(0, 120))}`}
        transitionTypes={NAV_FORWARD}
        className="flex min-h-11 flex-col justify-center text-read-text no-underline"
      >
        <span className="text-sm font-extrabold [overflow-wrap:anywhere]">
          {CHOOSER.rowTitle(trimmed)}
        </span>
        <span className="text-[13px] font-semibold text-muted">{CHOOSER.rowSubtitle}</span>
      </Link>
      <p className={NOTE}>{CHOOSER.quotaLine}</p>
    </div>
  );
}
