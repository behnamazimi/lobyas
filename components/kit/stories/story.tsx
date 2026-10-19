import type { ReactNode } from "react";

const THEMES = ["emerald", "dim"] as const;

/** One kit item, drawn in the light and the dim theme side by side (stacked on a phone). */
export function Story({
  title,
  note,
  width = 390,
  single = false,
  children,
}: {
  title: string;
  note?: string;
  /** Width of each panel in px, so the item shows at phone size. */
  width?: number;
  /** Draw once, in the page's own theme: for an item that opens over the page. */
  single?: boolean;
  children: ReactNode;
}) {
  const panelClass = "max-w-full min-w-0 rounded-3xl bg-base-200 p-4 text-base-content";
  const style = { width: width + 32 };
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="m-0 text-lg font-semibold">{title}</h3>
        {note ? <p className="mt-0.5 text-sm text-base-content/65">{note}</p> : null}
      </div>
      <div className="flex flex-wrap gap-4">
        {single ? (
          <div className={panelClass} style={style}>
            {children}
          </div>
        ) : (
          THEMES.map((theme) => (
            <div key={theme} data-theme={theme} className={panelClass} style={style}>
              <div className="mb-2 text-xs font-bold tracking-wide text-muted uppercase">
                {theme}
              </div>
              {children}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
