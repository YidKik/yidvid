
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { BackButton } from "@/components/navigation/BackButton";
import { ChannelsCounter } from "@/components/dashboard/youtube/ChannelsCounter";

export default function ChannelsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <ChannelsCounter />
      </div>
      <h1 className="text-3xl font-bold">Add YouTube Channels</h1>
      <YouTubeChannelsSection />
    </div>
  );
}
