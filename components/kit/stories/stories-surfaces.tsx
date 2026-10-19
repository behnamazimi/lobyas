import { BookOpen, Eye, Pencil, Trash2 } from "lucide-react";
import { Card, Divider, ListRow, SectionCard, Tile } from "@/components/kit";
import { Story } from "./story";

export function SurfaceStories() {
  return (
    <>
      <Story title="Card and tinted tiles">
        <Card className="p-5">
          <p className="m-0 font-heading text-2xl font-extrabold">A card</p>
          <p className="mt-1 text-sm font-semibold text-muted">
            White with the soft two-layer shadow.
          </p>
        </Card>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["read", "review", "quiz", "success", "hard", "wrong"] as const).map((tone) => (
            <Tile key={tone} tone={tone} size={44}>
              <BookOpen className="size-[22px]" aria-hidden />
            </Tile>
          ))}
          <Tile tone="read" size={48} serif>
            S
          </Tile>
          <Tile tone="quiz" size={48} serif>
            日
          </Tile>
        </div>
      </Story>
      <Story
        title="Section card and list rows"
        note="Rows with a chevron are one tap target, 56 px or taller."
      >
        <SectionCard title="Account" description="Manage how you log in, or delete your account.">
          <ListRow
            label="Email"
            subline="mina.vos.with.a.very.long.address@example-company-name.com"
          />
          <Divider />
          <ListRow
            href="/admin/kit"
            icon={<Eye className="size-5" aria-hidden />}
            label="Open"
            subline="See every part of the term"
          />
          <Divider />
          <ListRow
            href="/admin/kit"
            icon={<Pencil className="size-5" aria-hidden />}
            label="Edit term"
            subline="Definition, example and every other field"
          />
          <Divider />
          <ListRow
            href="/admin/kit"
            danger
            icon={<Trash2 className="size-5" aria-hidden />}
            label="Delete term"
            subline="Removes it and its progress"
          />
        </SectionCard>
      </Story>
    </>
  );
}
