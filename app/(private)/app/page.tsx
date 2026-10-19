import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";

export const metadata: Metadata = { title: "Home" };

export default function Page() {
  return <HomePage />;
}
