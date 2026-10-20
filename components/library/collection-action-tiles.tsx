import { Layers, Link2, MoreHorizontal, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { NAV_FORWARD } from "@/components/shared/view-transitions";

const TILE_CLASS =
  "flex min-h-[60px] flex-1 basis-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl bg-base-200 px-1 text-[13px] font-extrabold";

function ActionTile({
  icon,
  label,
  href,
  onPress,
  tour,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  onPress?: () => void;
  tour?: string;
}) {
  const body = (
    <>
      {icon}
      {label}
    </>
  );
  return href ? (
    <Link href={href} transitionTypes={NAV_FORWARD} className={TILE_CLASS} data-tour={tour}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onPress} className={TILE_CLASS} data-tour={tour}>
      {body}
    </button>
  );
}

/** Add terms (owner), Triage (while terms are untriaged), Share or Copy link, and More. */
export function CollectionActionTiles({
  isOwner,
  owned,
  triageHref,
  onAdd,
  onShare,
  onCopyLink,
  onMore,
}: {
  isOwner: boolean;
  owned: boolean;
  triageHref: string | null;
  onAdd: () => void;
  onShare: () => void;
  onCopyLink: () => void;
  onMore: () => void;
}) {
  return (
    <div className="mt-3 flex gap-2">
      {isOwner ? (
        <ActionTile
          icon={<Plus className="size-5" strokeWidth={2.4} aria-hidden />}
          label="Add terms"
          onPress={onAdd}
        />
      ) : null}
      {triageHref ? (
        <ActionTile
          icon={<Layers className="size-5" strokeWidth={2.4} aria-hidden />}
          label="Triage"
          href={triageHref}
        />
      ) : null}
      {owned ? (
        <ActionTile
          icon={<Share2 className="size-5" strokeWidth={2.4} aria-hidden />}
          label="Share"
          onPress={onShare}
        />
      ) : (
        <ActionTile
          icon={<Link2 className="size-5" strokeWidth={2.4} aria-hidden />}
          label="Copy link"
          onPress={onCopyLink}
        />
      )}
      <ActionTile
        icon={<MoreHorizontal className="size-5" strokeWidth={2.4} aria-hidden />}
        label="More"
        onPress={onMore}
        tour="library-actions"
      />
    </div>
  );
}
