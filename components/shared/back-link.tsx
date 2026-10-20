import { ChevronLeft } from "lucide-react";
import { IconButton } from "@/components/kit";
import { NAV_BACK } from "@/components/shared/view-transitions";

export const PUBLIC_HOME_PATH = "/";
export const PUBLIC_HOME_BACK_LABEL = "Back to home";

/** The 44px chevron above a public page's title. The name is for assistive tech only. */
export function HomeBackButton({
  href = PUBLIC_HOME_PATH,
  label = PUBLIC_HOME_BACK_LABEL,
}: {
  href?: string;
  label?: string;
}) {
  return (
    <IconButton label={label} href={href} transitionTypes={NAV_BACK} className="-ml-2 self-start">
      <ChevronLeft className="size-6" strokeWidth={2.6} aria-hidden />
    </IconButton>
  );
}
