import type { Metadata } from "next";
import { HomeHeader } from "@/components/app/shell/home-header";
import { EmptyPanel } from "@/components/kit";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-8 px-5 py-8">
      <HomeHeader />
      <EmptyPanel
        className="my-auto"
        title="Home is coming"
        description="Your study path will live here."
      />
    </div>
  );
}
