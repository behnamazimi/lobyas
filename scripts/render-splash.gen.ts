import sharp from "sharp";
import { it } from "vitest";
import { brandMarkSvg } from "@/lib/brand-icon";

/** The tile's size on the launch screen, in points (iOS) and dp (Android). */
const TILE = 108;
/** iOS centres the splash image at this size; Android 12+ draws an icon without a background
 *  in a frame this size. */
const IOS_FRAME = 240;
const ANDROID_FRAME = 288;

const PAPER = { light: "#fdfcf9", dark: "#1c1916" };

function render({
  size,
  frame,
  dark,
  background,
}: {
  size: number;
  frame: number;
  dark: boolean;
  background?: string;
}) {
  const tile = (size * TILE) / frame;
  const mark = brandMarkSvg({ maskable: false, rounded: true, dark }).replace(
    "<svg ",
    `<svg x="${(size - tile) / 2}" y="${(size - tile) / 2}" width="${tile}" height="${tile}" `,
  );
  const fill = background ? `<rect width="100%" height="100%" fill="${background}"/>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${fill}${mark}</svg>`;
  return sharp(Buffer.from(svg), { density: 72 }).png();
}

// The launch image (iOS, and the source capacitor-assets draws every other launch image from)
// and the Android 12+ splash icon, in light and dark. Run it with `pnpm mobile:splash`, then
// `pnpm mobile:assets`.
it("renders the splash art", async () => {
  for (const dark of [false, true]) {
    const theme = dark ? "dark" : "light";
    await render({ size: 2732, frame: IOS_FRAME, dark, background: PAPER[theme] }).toFile(
      `resources/${dark ? "splash-dark" : "splash"}.png`,
    );
    await render({ size: 1152, frame: ANDROID_FRAME, dark }).toFile(
      `android/app/src/main/res/drawable-${dark ? "night-" : ""}nodpi/splash_icon.png`,
    );
  }
}, 300_000);
