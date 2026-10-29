"use client";

import { useRef, useState } from "react";
import {
  TermNarrationPlayer,
  type TermNarrationHandle,
} from "@/components/terms/term-narration-player";
import { ListenButton } from "@/components/kit";
import { useMountEffect } from "@/hooks/use-mount-effect";

type DictationPlayerProps = {
  termId: string;
  clipUrl: string;
  /** Hides the "tap Play" note once the answer is in. */
  answered: boolean;
  /** The clip won't load: the question is skipped. */
  onCantListen: () => void;
};

/** Plays the word when the question opens; the learner can replay it any time.
 *  Only the clip the question was built with plays: a new one could say more
 *  than the word, or a renamed word. If it won't load, or they can't listen,
 *  the question is skipped. */
export function DictationPlayer({ termId, clipUrl, answered, onCantListen }: DictationPlayerProps) {
  const playerRef = useRef<TermNarrationHandle>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useMountEffect(() => {
    playerRef.current?.play();
  });

  return (
    <div className="mt-3 flex flex-col items-start gap-2">
      <TermNarrationPlayer
        termId={termId}
        clipUrl={clipUrl}
        preload
        canPrepare={false}
        showButton={false}
        handleRef={playerRef}
        onUnavailable={onCantListen}
        onAutoplayBlocked={() => setNeedsTap(true)}
      />
      <ListenButton
        label="Play"
        onPress={() => playerRef.current?.play()}
        className="h-14 pr-5 pl-3.5 text-base"
      />
      {needsTap && !answered ? (
        <p className="m-0 text-sm font-semibold text-muted">Tap Play to hear the word.</p>
      ) : null}
    </div>
  );
}
