"use client";

import { useEffect } from "react";
import { setCurrentCollection } from "@/lib/collections/current";

/** A `?collection=` link writes the app cookie after the page is shown.
 *  `"all"` is not passed in, so a mixed visit leaves the cookie alone. */
export function RememberCollectionFromLink({ collectionId }: { collectionId: string }) {
  useEffect(() => {
    setCurrentCollection(collectionId);
  }, [collectionId]);
  return null;
}
