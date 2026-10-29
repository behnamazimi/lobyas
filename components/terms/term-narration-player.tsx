"use client";

import { useImperativeHandle, useRef, useState, type Ref } from "react";
import {
  claimActiveAudio,
  isActiveAudio,
  releaseActiveAudio,
} from "@/components/shared/active-audio";
import { NarrationButton, type NarrationStatus } from "@/components/terms/narration-button";
import { useMountEffect } from "@/hooks/use-mount-effect";
import {
  canPlayThrough,
  isAbortError,
  isAutoplayBlocked,
  narrationSrc,
  resolveClipUrl,
  srcMatches,
  type PreparedClip,
} from "@/components/terms/narration-audio";

export type TermNarrationHandle = { play: () => void };

/** Play/pause for one term. `preload` buffers the clip before the tap;
 *  the collection list leaves it off so it does not fetch every term.
 *  `clipUrl` is the public address of the term's current clip: a string plays
 *  it straight from the CDN, null means there is no clip yet (so the first tap
 *  prepares one without a doomed request), undefined means it was not looked up
 *  and the app route is asked. */
export function TermNarrationPlayer({
  termId,
  clipUrl,
  preload = false,
  showButton = true,
  handleRef,
  onUnavailable,
  onAutoplayBlocked,
  canPrepare = true,
  look = "icon",
}: {
  termId: string;
  clipUrl?: string | null;
  preload?: boolean;
  showButton?: boolean;
  /** Lets a parent start the clip from its own press handler. */
  handleRef?: Ref<TermNarrationHandle>;
  /** Called when the clip can't be loaded or made. */
  onUnavailable?: () => void;
  /** Called when the browser refused to start the clip without a tap. */
  onAutoplayBlocked?: () => void;
  /** False plays only the given clip and never asks the server to make one. */
  canPrepare?: boolean;
  /** `pill` is the labelled Listen button of the study cards. */
  look?: "icon" | "pill";
}) {
  const [status, setStatus] = useState<NarrationStatus>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wantPlayingRef = useRef(false);
  const mountedRef = useRef(true);
  const abortRetriedRef = useRef(false);
  const routeTriedRef = useRef(false);
  const viaRouteRef = useRef(false);
  const prepareRef = useRef<"idle" | "running" | "done">("idle");
  const [prepared, setPrepared] = useState<PreparedClip>();
  const { url, knownMissing } = resolveClipUrl(clipUrl, prepared);
  const routeSrc = narrationSrc(termId);
  const src = url ?? routeSrc;

  useMountEffect(() => {
    return () => {
      mountedRef.current = false;
      wantPlayingRef.current = false;
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        releaseActiveAudio(audio);
      }
    };
  });

  function giveUp(audio: HTMLAudioElement) {
    wantPlayingRef.current = false;
    releaseActiveAudio(audio);
    setStatus("idle");
  }

  function fail(audio: HTMLAudioElement) {
    giveUp(audio);
    if (mountedRef.current) onUnavailable?.();
  }

  // Loading never generates audio. A failed public address gets one try at the
  // app route (which also retires a missing file); then the server makes the clip once.
  async function prepareThenPlay(audio: HTMLAudioElement) {
    // An error event and a rejected play() can both land for one failed load.
    if (prepareRef.current === "running") return;
    // A late signal from the address we already left, while the route is loading.
    if (routeTriedRef.current && audio.networkState === HTMLMediaElement.NETWORK_LOADING) return;
    if (prepareRef.current !== "done" && !routeTriedRef.current && src !== routeSrc) {
      routeTriedRef.current = true;
      viaRouteRef.current = true;
      abortRetriedRef.current = false;
      audio.src = routeSrc;
      audio.load();
      void playClip(audio);
      return;
    }
    if (prepareRef.current === "done" || !canPrepare) {
      fail(audio);
      return;
    }
    prepareRef.current = "running";
    setStatus("loading");
    let preparedSrc = src;
    try {
      const response = await fetch(routeSrc, { method: "POST" });
      if (!response.ok) {
        prepareRef.current = "done";
        fail(audio);
        return;
      }
      const body: { url?: string } = await response.json();
      if (body.url) {
        setPrepared({ from: clipUrl, url: body.url });
        viaRouteRef.current = false;
        preparedSrc = body.url;
      }
    } catch {
      prepareRef.current = "done";
      fail(audio);
      return;
    }
    prepareRef.current = "done";
    if (!wantPlayingRef.current) return;
    abortRetriedRef.current = false;
    audio.src = preparedSrc;
    audio.load();
    void playClip(audio);
  }

  function playClip(audio: HTMLAudioElement) {
    return audio
      .play()
      .then(() => {
        if (wantPlayingRef.current) setStatus("playing");
      })
      .catch((error: unknown) => {
        if (isAutoplayBlocked(error)) {
          giveUp(audio);
          if (mountedRef.current) onAutoplayBlocked?.();
          return;
        }
        // preload "none" never fires canplay unless something asks it to load.
        if (isAbortError(error) && wantPlayingRef.current && !abortRetriedRef.current) {
          abortRetriedRef.current = true;
          const retry = () => {
            if (wantPlayingRef.current && audio.paused) void playClip(audio);
          };
          if (canPlayThrough(audio)) retry();
          else {
            audio.addEventListener("canplay", retry, { once: true });
            audio.load();
          }
          return;
        }
        if (wantPlayingRef.current) void prepareThenPlay(audio);
        else giveUp(audio);
      });
  }

  function startWhenReady(audio: HTMLAudioElement) {
    const start = () => {
      if (wantPlayingRef.current && audio.paused) void playClip(audio);
    };
    if (canPlayThrough(audio)) {
      start();
      return;
    }
    // play() in the same turn as assigning src is aborted by that load.
    queueMicrotask(start);
  }

  function handlePress() {
    const audio = audioRef.current;
    if (!audio) return;

    if (status === "playing") {
      wantPlayingRef.current = false;
      audio.pause();
      return;
    }

    abortRetriedRef.current = false;
    routeTriedRef.current = false;
    prepareRef.current = "idle";
    wantPlayingRef.current = true;

    if (knownMissing) {
      claimActiveAudio(audio);
      void prepareThenPlay(audio);
      return;
    }

    // iOS Safari will not replay a finished clip; loading it again makes it play.
    if (audio.ended) audio.load();

    // Once the route has had to serve this clip, skip the address that failed.
    const target = viaRouteRef.current ? routeSrc : src;
    const alreadySet = srcMatches(audio, target);
    const ready = alreadySet && canPlayThrough(audio);
    if (!alreadySet) audio.src = target;

    claimActiveAudio(audio);

    // A preload that already failed will not retry on its own.
    if (audio.error) {
      void prepareThenPlay(audio);
      return;
    }

    if (ready) {
      setStatus("playing");
      void playClip(audio);
      return;
    }

    setStatus("loading");
    startWhenReady(audio);
  }

  useImperativeHandle(handleRef, () => ({
    play: () => {
      if (status !== "playing" && status !== "loading") handlePress();
    },
  }));

  function handlePause() {
    const audio = audioRef.current;
    if (!audio || audio.ended) return;
    // A load can pause the element while this player still means to play.
    if (wantPlayingRef.current && isActiveAudio(audio)) return;
    wantPlayingRef.current = false;
    releaseActiveAudio(audio);
    setStatus("paused");
  }

  function handlePlaying() {
    if (wantPlayingRef.current) setStatus("playing");
  }

  function handleEnded() {
    wantPlayingRef.current = false;
    const audio = audioRef.current;
    if (audio) releaseActiveAudio(audio);
    setStatus("idle");
  }

  function handleError() {
    const audio = audioRef.current;
    if (!audio) return;
    if (wantPlayingRef.current) void prepareThenPlay(audio);
    else if (canPrepare) giveUp(audio);
    else fail(audio);
  }

  return (
    <span className="inline-flex" title="AI voice">
      <audio
        ref={audioRef}
        hidden
        src={preload && !knownMissing ? src : undefined}
        preload={preload && !knownMissing ? "auto" : "none"}
        onEnded={handleEnded}
        onPlaying={handlePlaying}
        onError={handleError}
        onPause={handlePause}
      />
      {showButton ? <NarrationButton status={status} look={look} onPress={handlePress} /> : null}
    </span>
  );
}
