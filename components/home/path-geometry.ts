/** Where the path's stops sit. Positions are x in a design width (scaled to the
 *  panel) and y in px, so a narrow phone squeezes the zigzag instead of overflowing. */
type Point = { cx: number; cy: number };

export type PathGeometry = {
  width: number;
  height: number;
  nodeSize: 100 | 104;
  textWidth: number;
  /** Space between a node's centre and its text. */
  textOffset: number;
  stops: [Point & { side: "right" }, Point & { side: "left" }, Point & { side: "right" }];
  trophy: Point & { size: number; textWidth: number };
  curve: string;
  haloSize: number;
};

export const PHONE_PATH: PathGeometry = {
  width: 390,
  height: 580,
  nodeSize: 100,
  textWidth: 184,
  textOffset: 74,
  stops: [
    { cx: 112, cy: 70, side: "right" },
    { cx: 278, cy: 210, side: "left" },
    { cx: 112, cy: 350, side: "right" },
  ],
  trophy: { cx: 278, cy: 490, size: 80, textWidth: 196 },
  curve: "M112 70C112 140 278 140 278 210C278 280 112 280 112 350C112 420 278 420 278 490",
  haloSize: 140,
};

export const WIDE_PATH: PathGeometry = {
  width: 560,
  height: 600,
  nodeSize: 104,
  textWidth: 180,
  textOffset: 70,
  stops: [
    { cx: 170, cy: 80, side: "right" },
    { cx: 390, cy: 230, side: "left" },
    { cx: 170, cy: 380, side: "right" },
  ],
  trophy: { cx: 390, cy: 530, size: 104, textWidth: 210 },
  curve: "M170 80C170 160 390 160 390 230C390 300 170 300 170 380C170 460 390 460 390 530",
  haloSize: 152,
};
