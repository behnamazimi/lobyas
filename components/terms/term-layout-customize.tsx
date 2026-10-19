"use client";

import { Button } from "@/components/ui/button";
import { preloadTermLayoutEditor, useTermLayoutScope } from "./term-layout-provider";

/** The one place a learner changes what sits under "More": a quiet text button
 *  under the term that opens the editor. */
export function TermLayoutCustomize({ collectionId }: { collectionId: string | undefined }) {
  const access = useTermLayoutScope(collectionId);
  if (!access) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="min-h-11 font-extrabold text-ink-soft"
      onHoverStart={preloadTermLayoutEditor}
      onFocus={preloadTermLayoutEditor}
      onPress={() => access.openEditor(collectionId)}
    >
      Customize
    </Button>
  );
}
