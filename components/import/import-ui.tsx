import type { ReactNode } from "react";
import { SECTION_TITLE, SectionCard, Tile } from "@/components/kit";

export function ImportCard({
  icon,
  title,
  description,
  children,
}: {
  /** An element, not a component, so server pages can pass it. */
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <SectionCard>
      <div className="flex items-start gap-3">
        <Tile tone="read">{icon}</Tile>
        <div className="min-w-0 flex-1">
          <h2 className={SECTION_TITLE}>{title}</h2>
          {description ? (
            <p className="m-0 mt-0.5 text-[13px] leading-snug font-semibold text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </SectionCard>
  );
}

export function ImportCodePanel({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="relative">
      <div className="max-h-[320px] overflow-auto rounded-2xl bg-base-200 p-3">
        <pre className="m-0 font-mono text-xs leading-5 whitespace-pre-wrap text-base-content">
          {children}
        </pre>
      </div>
      {actions ? <div className="absolute top-2 right-2">{actions}</div> : null}
    </div>
  );
}
