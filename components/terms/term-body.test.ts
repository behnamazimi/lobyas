import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { toPlacement, type Placement } from "@/lib/terms/term-layout";
import type { Term } from "@/lib/terms/types";
import { TermBody } from "./term-body";

const term: Term = {
  id: "t1",
  term: "wel",
  category: "Bijwoord",
  definition: "Maakt een zin extra positief.",
  example: "Jawel, ik heb wel tijd.",
  mentalModel: "Denk aan een lamp.",
  discussion: "",
  note: "(emphatic) do/does",
  relationships: [],
};

function render(placement?: Placement) {
  return renderToStaticMarkup(
    createElement(TermBody, {
      term,
      language: "nl",
      placement,
      customize: createElement("button", null, "Customize"),
    }),
  );
}

describe("TermBody", () => {
  it("shows every block and no More without a placement", () => {
    const html = render();
    expect(html).toContain("Denk aan een lamp.");
    expect(html).toContain("Jawel, ik heb wel tijd.");
    expect(html).toContain("google.com/search");
    expect(html).not.toContain("collapsible");
    expect(html).not.toContain("Customize");
  });

  it("keeps blocks under More collapsed, with the count and Customize", () => {
    const html = render(toPlacement({ mentalModel: "more", searchLink: "more" }));
    expect(html).toContain("More (2)");
    expect(html).toContain("Customize");
    expect(html.indexOf("More (2)")).toBeLessThan(html.indexOf("Customize"));
    expect(html).toMatch(/hidden=""[^>]*>[\s\S]*Denk aan een lamp\./);
    expect(html.indexOf("Jawel, ik heb wel tijd.")).toBeLessThan(html.indexOf('hidden=""'));
  });

  it("offers Customize but no More when nothing sits under it", () => {
    const html = render(toPlacement({}));
    expect(html).toContain("Customize");
    expect(html).not.toContain("More (");
  });

  it("doesn't count a block under More that the term has no content for", () => {
    const html = render(toPlacement({ antiExample: "more", discussion: "more" }));
    expect(html).not.toContain("More (");
  });

  it("shows only the definition and the search link for a bare term", () => {
    const html = renderToStaticMarkup(
      createElement(TermBody, {
        term: { ...term, example: "", mentalModel: undefined, note: undefined },
      }),
    );
    expect(html).toContain("Maakt een zin extra positief.");
    expect(html).not.toContain("Example");
    expect(html).toContain("google.com/search");
  });

  it("links a related term only when it has an address", () => {
    const related = {
      ...term,
      relationships: [
        {
          id: "r1",
          relationshipType: "leads_to",
          description: "Daarna.",
          direction: "outgoing" as const,
          relatedTermId: "a",
          relatedTermName: "Ja",
        },
        {
          id: "r2",
          relationshipType: "opposite_of",
          description: "",
          direction: "outgoing" as const,
          relatedTermId: "b",
          relatedTermName: "Nee",
        },
      ],
    };
    const html = renderToStaticMarkup(
      createElement(TermBody, {
        term: related,
        language: "nl",
        getRelationshipHref: (id: string) => (id === "a" ? "/terms/a" : undefined),
      }),
    );
    expect(html).toContain('href="/terms/a"');
    expect(html).not.toContain('href="/terms/b"');
    expect(html).toContain("leads to");
    expect(html).toContain("Verwante termen");
  });
});
