import { BookOpen, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Banner,
  Card,
  Divider,
  ListRow,
  Pill,
  SectionCard,
  StatTile,
  Tile,
} from "@/components/kit";
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
      <Story title="Stat tiles" note="White on the page, or tinted when it carries a result.">
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile value="12" label="day streak" />
          <StatTile value="20" label="reviewed today" />
          <StatTile tone="success" value="8" label="Correct" />
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
      <Story
        title="Banner"
        note="Yellow for something to do, green for done. The action and dismiss are optional."
      >
        <div className="flex flex-col gap-2.5">
          <Banner
            action={
              <Pill variant="secondary" href="/admin/kit">
                Finish
              </Pill>
            }
          >
            <strong className="font-extrabold">1 term to finish.</strong> Add a definition so it can
            be studied.
          </Banner>
          <Banner tone="success" onDismiss={() => {}}>
            <strong className="font-extrabold">Added 24 terms to Standup</strong>
          </Banner>
        </div>
      </Story>
    </>
  );
}
