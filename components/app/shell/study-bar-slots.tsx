"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Slots = {
  center: HTMLElement | null;
  end: HTMLElement | null;
  setCenter: (node: HTMLElement | null) => void;
  setEnd: (node: HTMLElement | null) => void;
};

const SlotsContext = createContext<Slots | null>(null);

/** Lets a study page put its controls in the shell's study bar. */
export function StudyBarSlotsProvider({ children }: { children: ReactNode }) {
  const [center, setCenter] = useState<HTMLElement | null>(null);
  const [end, setEnd] = useState<HTMLElement | null>(null);
  const value = useMemo(() => ({ center, end, setCenter, setEnd }), [center, end]);
  return <SlotsContext.Provider value={value}>{children}</SlotsContext.Provider>;
}

export function useStudyBarSlots(): Slots | null {
  return useContext(SlotsContext);
}

/** Renders a page's controls into the study bar's first row. */
export function StudyBarControls({ center, end }: { center?: ReactNode; end?: ReactNode }) {
  const slots = useStudyBarSlots();
  if (!slots) return null;
  return (
    <>
      {center && slots.center ? createPortal(center, slots.center) : null}
      {end && slots.end ? createPortal(end, slots.end) : null}
    </>
  );
}
