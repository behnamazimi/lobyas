"use client";

import { useRef, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const SWIPE_THRESHOLD = 50;
const AXIS_LOCK_PX = 8;
const SLIDE_OUT_MS = 180;
// A direction you can't go still moves a little, so the swipe doesn't feel dead.
const BLOCKED_DRAG_FACTOR = 0.2;

type ReviewSwipeHandlers = {
  onReveal: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  enabled: boolean;
};

type Drag = { x: number; y: number; dx: number; axis: "x" | "y" | null };

/** Swipe left for the next card, right for the previous one, up to reveal.
 *  The card follows the finger sideways and slides off when the swipe counts. */
export function useReviewSwipe(
  ref: RefObject<HTMLElement | null>,
  { onReveal, onPrevious, onNext, canGoBack, canGoForward, enabled }: ReviewSwipeHandlers,
) {
  const reduceMotion = usePrefersReducedMotion();
  const dragRef = useRef<Drag | null>(null);

  function allowed(dx: number) {
    return dx < 0 ? canGoForward : canGoBack;
  }

  function paint(dx: number, animate: boolean) {
    const card = ref.current;
    if (!card || reduceMotion) return;
    card.style.transition = animate ? "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    card.style.transform = dx === 0 ? "" : `translateX(${dx}px)`;
  }

  function slideOut(direction: 1 | -1, done: () => void) {
    const card = ref.current;
    if (!card || reduceMotion) {
      done();
      return;
    }
    card.style.transition = `transform ${SLIDE_OUT_MS}ms ease-in, opacity ${SLIDE_OUT_MS}ms ease-in`;
    card.style.transform = `translateX(${direction * card.offsetWidth}px)`;
    card.style.opacity = "0";
    window.setTimeout(() => {
      done();
      // The next card replaces this one; if it hasn't (still loading), bring it back.
      window.setTimeout(() => {
        card.style.opacity = "";
        paint(0, true);
      }, 300);
    }, SLIDE_OUT_MS);
  }

  function handleTouchStart(event: React.TouchEvent) {
    if (!enabled) return;
    const touch = event.touches[0];
    dragRef.current = { x: touch.clientX, y: touch.clientY, dx: 0, axis: null };
  }

  function handleTouchMove(event: React.TouchEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const touch = event.touches[0];
    const dx = touch.clientX - drag.x;
    const dy = touch.clientY - drag.y;
    if (drag.axis === null) {
      if (Math.abs(dx) > AXIS_LOCK_PX && Math.abs(dx) > Math.abs(dy)) drag.axis = "x";
      else if (Math.abs(dy) > AXIS_LOCK_PX) drag.axis = "y";
    }
    if (drag.axis !== "x") return;
    drag.dx = dx;
    paint(allowed(dx) ? dx : dx * BLOCKED_DRAG_FACTOR, false);
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!enabled || !drag) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - drag.x;
    const deltaY = touch.clientY - drag.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absY > SWIPE_THRESHOLD && absY > absX && deltaY < 0) {
      onReveal();
      return;
    }

    if (absX > SWIPE_THRESHOLD && absX > absY && allowed(deltaX)) {
      slideOut(deltaX < 0 ? -1 : 1, deltaX < 0 ? onNext : onPrevious);
      return;
    }

    paint(0, true);
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: () => {
      dragRef.current = null;
      paint(0, true);
    },
  };
}
