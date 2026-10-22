import { brandMarkSvg } from "@/lib/brand-icon";

const FRAME = { __html: brandMarkSvg({ maskable: false, rounded: true }) };

/** The app icon as the native launch screen draws it. Hidden until `html[data-splash]` is set
 *  (see globals.css), so every page can carry it; NativeSplash runs it. */
export function NativeSplashFrame() {
  return <div id="native-splash" aria-hidden="true" dangerouslySetInnerHTML={FRAME} />;
}
