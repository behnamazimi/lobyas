/** The app's own address for a term's clip: the fallback when the public
 *  address is unknown or fails, and where a clip is prepared. */
export function narrationSrc(termId: string): string {
  return `/api/narration/${termId}`;
}

export function srcMatches(audio: HTMLAudioElement, src: string): boolean {
  const attr = audio.getAttribute("src");
  if (attr === src) return true;
  if (!audio.src) return false;
  return audio.src === new URL(src, document.baseURI).href;
}

export function canPlayThrough(audio: HTMLAudioElement): boolean {
  return audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** The browser refused to play without a tap; the clip itself is fine. */
export function isAutoplayBlocked(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotAllowedError";
}

export type PreparedClip = { from: string | null | undefined; url: string };

/** A clip learned from a POST only holds while the parent still hands in the
 *  address it had then; a newer one from the parent wins. */
export function resolveClipUrl(clipUrl: string | null | undefined, prepared?: PreparedClip) {
  const preparedUrl = prepared && prepared.from === clipUrl ? prepared.url : undefined;
  return {
    url: preparedUrl ?? clipUrl ?? undefined,
    knownMissing: clipUrl === null && preparedUrl === undefined,
  };
}
