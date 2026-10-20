import { SegmentedControl } from "@/components/kit";
import type { BrowseCounts, BrowseGroup } from "@/lib/library/browse";
import { formatCount } from "@/lib/kit/text";

export function SharedCollectionsTabs({
  active,
  counts,
  onChange,
}: {
  active: BrowseGroup;
  counts: BrowseCounts["groups"];
  onChange: (group: BrowseGroup) => void;
}) {
  return (
    <SegmentedControl
      label="Collection source"
      value={active}
      onChange={(value) => onChange(value === "community" ? "community" : "builtin")}
      options={[
        { value: "builtin", label: `Built-in · ${formatCount(counts.builtin)}` },
        { value: "community", label: `Community · ${formatCount(counts.community)}` },
      ]}
    />
  );
}
