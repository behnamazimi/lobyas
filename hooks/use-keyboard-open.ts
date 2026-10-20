"use client";

import { useMountEffect } from "@/hooks/use-mount-effect";

/** A phone keyboard takes well over this much of the screen. */
const KEYBOARD_MIN_HEIGHT = 150;

function isTextField(element: Element | null): boolean {
  if (element instanceof HTMLTextAreaElement) return true;
  return (
    element instanceof HTMLInputElement && element.type !== "radio" && element.type !== "checkbox"
  );
}

/** Marks the page `data-keyboard="open"` while a text field has focus and the
 *  visible area has shrunk by a keyboard's worth. Focus alone is not enough:
 *  a field stays focused after the keyboard is dismissed. */
export function useKeyboardOpen() {
  useMountEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    let fullHeight = viewport.height;
    let width = viewport.width;

    function update() {
      if (!viewport) return;
      if (viewport.width !== width) {
        width = viewport.width;
        fullHeight = viewport.height;
      }
      const typing = isTextField(document.activeElement);
      if (!typing) fullHeight = Math.max(fullHeight, viewport.height);
      const open = typing && fullHeight - viewport.height > KEYBOARD_MIN_HEIGHT;
      if (open) {
        root.dataset.keyboard = "open";
        // The page shrinks to the space above the keyboard; keep the field in view there.
        document.activeElement?.scrollIntoView({ block: "nearest" });
      } else delete root.dataset.keyboard;
    }

    viewport.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      viewport.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
      delete root.dataset.keyboard;
    };
  });
}
