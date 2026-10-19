import { Bell } from "lucide-react";
import { IconButton, PageHeader, Rail, StudyTopBar, TabBar } from "@/components/kit";
import { Story } from "./story";

export function ShellStories() {
  return (
    <>
      <Story
        title="Tab bar"
        note="Phone and tablet. The shell hides it from 1024 px up and on study routes."
      >
        <div className="overflow-hidden rounded-2xl">
          <TabBar activeKey="home" placement="static" className="!h-[84px]" />
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl">
          <TabBar activeKey="me" placement="static" className="!h-[84px]" />
        </div>
      </Story>
      <Story title="Desktop rail" note="Shown from 1024 px up, beside the content." width={280}>
        <Rail
          activeKey="library"
          className="h-[420px] rounded-2xl"
          brand={<span className="font-heading text-2xl font-extrabold">Lobyas</span>}
          switcher={
            <div className="rounded-2xl bg-base-200 p-3 text-sm font-extrabold">Standup</div>
          }
          streak={
            <div className="rounded-full bg-base-200 px-4 py-2 text-sm font-extrabold">
              12 day streak
            </div>
          }
        />
      </Story>
      <Story title="Page header" note="Back, serif title, action. A long title wraps.">
        <PageHeader title="Settings" backHref="/admin/kit" />
        <PageHeader
          className="mt-6"
          title="Distributed Systems Fundamentals for Engineering Interviews"
          subline="A daily pace for each mode. Every goal is optional."
          action={
            <IconButton label="Notifications">
              <Bell className="size-5" aria-hidden />
            </IconButton>
          }
        />
      </Story>
      <Story
        title="Study top bar"
        note="With a goal ring, with a running count, and with a long collection name."
      >
        <div className="flex flex-col gap-4">
          <StudyTopBar
            closeHref="/admin/kit"
            collection={{ name: "Standup", letter: "S", tone: "read" }}
            goal={{ label: "18 of 20 today", value: 0.9, tone: "review" }}
          />
          <StudyTopBar
            closeHref="/admin/kit"
            collection={{ name: "Standup", letter: "S", tone: "read" }}
            goal={{ label: "312 today", tone: "review" }}
          />
          <StudyTopBar
            closeHref="/admin/kit"
            collection={{
              name: "Distributed Systems Fundamentals for Engineering Interviews",
              letter: "D",
              tone: "quiz",
            }}
            goal={{ label: "1,024 of 2,000 today", value: 0.5, tone: "quiz" }}
          />
        </div>
      </Story>
    </>
  );
}
