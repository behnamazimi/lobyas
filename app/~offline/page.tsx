import type { Metadata } from "next";
import { OfflineRetryButton } from "@/components/pwa/offline-retry-button";
import { OfflineScene } from "@/components/illustrations/scenes/offline";
import { StatusScreen } from "@/components/kit";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <StatusScreen
      illustration={<OfflineScene />}
      title="You’re offline"
      description="Lobyas needs a connection to load your terms. Check your Wi-Fi or mobile data, then try again."
      actions={<OfflineRetryButton />}
    />
  );
}
