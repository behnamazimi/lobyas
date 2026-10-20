import { SegmentedControl } from "@/components/kit";

export type MasteryTab = "overview" | "terms";

export function MasteryTabs({
  active,
  onChange,
}: {
  active: MasteryTab;
  onChange: (tab: MasteryTab) => void;
}) {
  return (
    <SegmentedControl
      label="Mastery views"
      value={active}
      onChange={(value) => onChange(value === "terms" ? "terms" : "overview")}
      options={[
        { value: "overview", label: "Overview" },
        { value: "terms", label: "Terms" },
      ]}
    />
  );
}
