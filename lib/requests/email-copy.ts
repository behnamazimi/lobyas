import { pluralize } from "@/lib/utils";
import { REQUEST_COPY } from "./copy";
import type { DeclineReason } from "./types";

export type RequestEmail = { subject: string; text: string; html: string };

/** Emails stay plain on purpose: mail apps drop web fonts. The button is the app's ink. */
export const EMAIL_SHELL_STYLE =
  "font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto;";
export const EMAIL_BUTTON_STYLE =
  "display:inline-block;padding:10px 16px;background:#2A2420;color:#fff;text-decoration:none;border-radius:6px;";
export const EMAIL_MUTED_STYLE = "color:#6F675D;font-size:13px;";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type Layout = {
  heading: string;
  paragraphs: string[];
  button?: { label: string; url: string };
};

/** Every piece of text is escaped here, because the topic and the question are written by people. */
function layout({ heading, paragraphs, button }: Layout): { text: string; html: string } {
  const text = [heading, ...paragraphs, ...(button ? [`${button.label}: ${button.url}`] : [])].join(
    "\n\n",
  );
  const html = `
      <div style="${EMAIL_SHELL_STYLE}">
        <h1 style="font-size: 20px;">${escapeHtml(heading)}</h1>
        ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n        ")}
        ${
          button
            ? `<p>
          <a href="${escapeHtml(button.url)}" style="${EMAIL_BUTTON_STYLE}">
            ${escapeHtml(button.label)}
          </a>
        </p>`
            : ""
        }
      </div>
    `;
  return { text, html };
}

export function build(subject: string, content: Layout): RequestEmail {
  return { subject, ...layout(content) };
}

export function buildReadyEmail(input: {
  topic: string;
  terms: number;
  deliveryKind: "prepared" | "added_shared" | "filled";
  collectionName: string | null;
  url: string;
}): RequestEmail {
  const line =
    input.deliveryKind === "added_shared" && input.collectionName
      ? REQUEST_COPY.card.addedShared(input.collectionName)
      : input.deliveryKind === "filled"
        ? REQUEST_COPY.card.filled(input.terms)
        : `${pluralize(input.terms, "term")} ${input.terms === 1 ? "is" : "are"} in your Library, ready to read.`;
  return build(`"${input.topic}" is ready in your Library`, {
    heading: "Your collection is ready",
    paragraphs: [line],
    button: { label: "Start reading", url: input.url },
  });
}

export function buildNeedsInputEmail(input: {
  topic: string;
  question: string;
  url: string;
}): RequestEmail {
  return build(`A quick question about "${input.topic}"`, {
    heading: REQUEST_COPY.card.question,
    paragraphs: [input.question],
    button: { label: "Reply in your Library", url: input.url },
  });
}

export function buildDelayEmail(input: { topic: string; date: string; url: string }): RequestEmail {
  return build(`"${input.topic}" is taking a little longer`, {
    heading: "Taking a little longer than usual",
    paragraphs: [
      `Sorry for the wait. “${input.topic}” is taking a little longer than we expected. We now expect to have it ready by ${input.date}.`,
    ],
    button: { label: "Open your Library", url: input.url },
  });
}

export function buildDeclinedEmail(input: {
  topic: string;
  reason: DeclineReason;
  note: string | null;
  pasteUrl: string;
}): RequestEmail {
  return build(`We couldn't prepare "${input.topic}"`, {
    heading: REQUEST_COPY.card.declinedTitle,
    paragraphs: [
      REQUEST_COPY.declineReasons[input.reason],
      ...(input.note ? [input.note] : []),
      "In the meantime, you can paste a list of your own or browse the built-in and community collections.",
    ],
    button: { label: REQUEST_COPY.card.pasteList, url: input.pasteUrl },
  });
}

/** For the people who prepare collections, not for the requester. */
export function buildAdminNoticeEmail(input: {
  topic: string;
  kindLabel: string;
  languageLabel: string;
  adminUrl: string;
}): RequestEmail {
  return build("New collection request", {
    heading: "A new collection request came in",
    paragraphs: [`${input.kindLabel}, ${input.languageLabel}: ${input.topic}`],
    button: { label: "Open the request desk", url: input.adminUrl },
  });
}
