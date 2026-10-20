import type { GoalTier } from "@/lib/goals/levels";
import { blob, box, quad, wave } from "../geometry";
import { Illustration } from "../illustration";
import { Eye, Face } from "../marks";
import { Motion } from "../motion";
import { BLUE, CORAL, PURPLE, YELLOW } from "../palette";
import { Line, Shape } from "../shape";

/** Thinner ink than the full-size scenes: these draw small. */
const WEIGHT = { body: 3.4, detail: 2.6, fine: 2 };
const OFFSET = [3.5, 3] as const;

/** Each tier's lobya: Lobyar reads, Lobyare reviews, Lobyaq quizzes. */
export const GOAL_LOBYAS: Record<GoalTier, { color: string; seed: number }> = {
  read: { color: CORAL, seed: 8 },
  review: { color: PURPLE, seed: 6 },
  quiz: { color: BLUE, seed: 3 },
};

/** What each lobya carries for its job: a book, a card, a checked answer. */
export function GoalProp({ tier, x, y }: { tier: GoalTier; x: number; y: number }) {
  if (tier === "read") {
    return (
      <g>
        <Shape
          d={quad([
            [x - 22, y - 10],
            [x, y - 4],
            [x, y + 16],
            [x - 22, y + 10],
          ])}
          color={YELLOW}
          stroke={WEIGHT.detail}
          offset={[3, 3]}
        />
        <Shape
          d={quad([
            [x, y - 4],
            [x + 22, y - 10],
            [x + 22, y + 10],
            [x, y + 16],
          ])}
          color={YELLOW}
          stroke={WEIGHT.detail}
          offset={[3, 3]}
        />
      </g>
    );
  }
  if (tier === "review") {
    // Two flashcards fanned out, with a flip arrow over them.
    return (
      <g>
        <g transform={`rotate(-14 ${x} ${y})`}>
          <Shape
            d={box(x - 18, y - 20, 30, 40, { seed: 7, bow: 2 })}
            color={YELLOW}
            stroke={WEIGHT.detail}
            offset={[3, 3]}
          />
        </g>
        <g transform={`rotate(8 ${x} ${y})`}>
          <Shape
            d={box(x - 10, y - 18, 30, 40, { seed: 4, bow: 2 })}
            color={BLUE}
            stroke={WEIGHT.detail}
            offset={[3, 3]}
          />
          <Line d={wave(x - 4, y + 2, 18, { amp: 2, period: 8, seed: 2 })} stroke={WEIGHT.fine} />
        </g>
        <Line
          d={`M${x - 14} ${y - 30}Q${x + 2} ${y - 44} ${x + 16} ${y - 30}M${x + 9} ${y - 33}L${x + 16} ${y - 30}L${x + 14} ${y - 38}`}
          stroke={WEIGHT.fine}
        />
      </g>
    );
  }
  return (
    <g transform={`rotate(6 ${x} ${y})`}>
      <Shape
        d={box(x - 20, y - 16, 40, 32, { seed: 5, bow: 2 })}
        color={YELLOW}
        stroke={WEIGHT.detail}
        offset={[3, 3]}
      />
      <Line d={`M${x - 9} ${y}L${x - 2} ${y + 7}L${x + 10} ${y - 7}`} stroke={WEIGHT.detail} />
    </g>
  );
}

/** Just the lobya's face, for small spots like the progress rings. */
export function GoalLobyaHead({ tier, className }: { tier: GoalTier; className?: string }) {
  return <LobyaHead {...GOAL_LOBYAS[tier]} className={className} />;
}

/** Any lobya's face: the seed shapes it, so each seed is a different lobya. */
function LobyaHead({
  color,
  seed,
  className,
}: {
  color: string;
  seed: number;
  className?: string;
}) {
  return (
    <Illustration viewBox="10 10 80 84" className={className}>
      <Shape
        offset={OFFSET}
        stroke={WEIGHT.body}
        d={blob({ cx: 50, cy: 54, rx: 30, ry: 34, taper: 0.1, seed })}
        color={color}
      />
      <Motion kind="blink" phase={seed * 0.3}>
        <Eye x={42} y={48} r={4.5} />
        <Eye x={58} y={46} r={4.5} />
      </Motion>
      <Face>
        <Line d="M42 62Q50 69 58 62" stroke={WEIGHT.detail} />
      </Face>
    </Illustration>
  );
}
