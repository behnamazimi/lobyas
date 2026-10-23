import { ChevronLeft } from "lucide-react";
import { IconButton } from "@/components/kit";
import { NAV_BACK } from "@/components/shared/view-transitions";

/** The 44px chevron above a public page's title. The name is for assistive tech only. */
export function HomeBackButton({ href, label }: { href: string; label: string }) {
  return (
    <IconButton
      label={label}
      href={href}
      prefetch={false}
      transitionTypes={NAV_BACK}
      className="-ml-2 self-start"
    >
      <ChevronLeft className="size-6" strokeWidth={2.6} aria-hidden />
    </IconButton>
  );
}
