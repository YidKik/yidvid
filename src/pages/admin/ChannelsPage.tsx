
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { BackButton } from "@/components/navigation/BackButton";

export default function ChannelsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Channel Management</h1>
      <YouTubeChannelsSection />
    </div>
  );
}
