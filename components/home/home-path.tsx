import { BookOpen, RotateCw, Trophy, Zap, Check } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { PathStop, Pill } from "@/components/kit";
import type { GoalTier } from "@/lib/goals/levels";
import type { HomePathData, PathStopData } from "@/lib/home/path";
import { cn } from "@/lib/utils";
import { WIDE_PATH, PHONE_PATH, type PathGeometry } from "./path-geometry";

const ICONS: Record<GoalTier, typeof BookOpen> = {
  read: BookOpen,
  review: RotateCw,
  quiz: Zap,
};
const HALO: Record<GoalTier, string> = {
  read: "bg-read-tint",
  review: "bg-review-tint",
  quiz: "bg-quiz-tint",
};
const SUB_TEXT: Record<GoalTier, string> = {
  read: "text-read-text",
  review: "text-review-text",
  quiz: "text-quiz-text",
};

function xPercent(geo: PathGeometry, x: number): number {
  return (x / geo.width) * 100;
}

function centered(geo: PathGeometry, cx: number, cy: number): CSSProperties {
  return {
    left: `${xPercent(geo, cx)}%`,
    top: cy,
    transform: "translate(-50%, -50%)",
  };
}

function StopText({
  geo,
  stop,
  side,
  cy,
  cx,
  pillText,
  wide,
}: {
  geo: PathGeometry;
  stop: PathStopData;
  side: "left" | "right";
  cx: number;
  cy: number;
  pillText: string;
  wide: boolean;
}) {
  const place: CSSProperties =
    side === "right"
      ? { left: `calc(${xPercent(geo, cx)}% + ${geo.textOffset}px)` }
      : { right: `calc(${100 - xPercent(geo, cx)}% + ${geo.textOffset}px)` };
  return (
    <div
      className={cn(
        "absolute flex h-[130px] -translate-y-1/2 flex-col justify-center gap-0.5",
        side === "left" ? "items-end text-end" : "items-start text-start",
      )}
      style={{ ...place, top: cy, maxWidth: geo.textWidth }}
    >
      <div className={cn("font-extrabold", wide ? "text-[22px]" : "text-xl")}>{stop.label}</div>
      {stop.sub ? (
        <div
          className={cn(
            "font-extrabold",
            wide ? "text-[15px]" : "text-sm",
            stop.met ? "text-success-text" : SUB_TEXT[stop.tier],
          )}
        >
          {stop.sub}
        </div>
      ) : null}
      <div className={cn("font-semibold text-muted", wide ? "text-sm" : "text-[13px]")}>
        {stop.queueLine}
      </div>
      {stop.highlighted ? (
        <Pill href={stop.href} className="mt-2">
          {pillText}
          <span aria-hidden>→</span>
        </Pill>
      ) : null}
    </div>
  );
}

function TrophyStop({
  geo,
  data,
  wide,
  prompt,
}: {
  geo: PathGeometry;
  data: HomePathData;
  wide: boolean;
  prompt: ReactNode;
}) {
  const { trophy } = geo;
  if (data.trophy.kind === "prompt") return prompt;
  const done = data.trophy.kind === "done";
  const nodeSize = wide ? 104 : 80;
  return (
    <>
      <div
        className={cn(
          "absolute flex items-center justify-center rounded-full",
          done ? "bg-success text-success-content" : "bg-base-300 text-muted",
        )}
        style={{
          ...centered(geo, trophy.cx, trophy.cy),
          width: nodeSize,
          height: nodeSize,
        }}
        aria-hidden
      >
        {done ? <Check className="size-9" strokeWidth={3} /> : <Trophy className="size-8" />}
      </div>
      <div
        className="absolute flex h-[100px] -translate-y-1/2 flex-col items-end justify-center gap-0.5 text-end"
        style={{
          right: `calc(${100 - xPercent(geo, trophy.cx)}% + ${nodeSize / 2 + 22}px)`,
          top: trophy.cy,
          maxWidth: trophy.textWidth,
        }}
      >
        <div className={cn("font-extrabold", wide ? "text-xl" : "text-lg")}>
          {data.trophy.title}
        </div>
        <div className={cn("font-semibold text-muted", wide ? "text-sm" : "text-[13px]")}>
          {data.trophy.note}
        </div>
      </div>
    </>
  );
}

/** Today's path: Read, Review and Quiz as stops on a dotted trail. `wide` is the
 *  desktop panel; the phone version is the same trail, tighter. */
export function HomePath({
  data,
  wide = false,
  prompt,
}: {
  data: HomePathData;
  wide?: boolean;
  /** Drawn where the trophy goes when no goals are set. */
  prompt?: ReactNode;
}) {
  const geo = wide ? WIDE_PATH : PHONE_PATH;
  const highlighted = data.stops.find((stop) => stop.highlighted);
  const showsTrophy = data.trophy.kind !== "prompt" || !wide;
  const height = showsTrophy ? geo.height : geo.stops[2].cy + 110;
  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: geo.width, height }}>
      <svg
        viewBox={`0 0 ${geo.width} ${geo.height}`}
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full"
        style={{ height: geo.height }}
        aria-hidden
      >
        <path
          d={showsTrophy ? geo.curve : geo.curve.split("C").slice(0, 3).join("C")}
          fill="none"
          className="stroke-line"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="1 15"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {highlighted ? (
        <span
          aria-hidden
          className={cn("absolute rounded-full", HALO[highlighted.tier])}
          style={{
            ...centered(
              geo,
              geo.stops[data.stops.indexOf(highlighted)].cx,
              geo.stops[data.stops.indexOf(highlighted)].cy,
            ),
            width: geo.haloSize,
            height: geo.haloSize,
          }}
        />
      ) : null}
      {data.stops.map((stop, index) => {
        const point = geo.stops[index];
        const Icon = ICONS[stop.tier];
        return (
          <div key={stop.tier}>
            <div className="absolute" style={centered(geo, point.cx, point.cy)}>
              <PathStop
                href={stop.href}
                tone={stop.tier}
                label={stop.aria}
                ringValue={stop.ringValue}
                met={stop.met}
                highlighted={stop.highlighted}
                onCard={wide}
                size={geo.nodeSize}
                icon={<Icon className={wide ? "size-9" : "size-[34px]"} strokeWidth={2.2} />}
              />
            </div>
            <StopText
              geo={geo}
              stop={stop}
              side={point.side}
              cx={point.cx}
              cy={point.cy}
              pillText={data.pillText}
              wide={wide}
            />
          </div>
        );
      })}
      {showsTrophy ? <TrophyStop geo={geo} data={data} wide={wide} prompt={prompt} /> : null}
    </div>
  );
}
