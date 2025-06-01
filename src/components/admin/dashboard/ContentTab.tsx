
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { MusicArtistsSection } from "@/components/dashboard/MusicArtistsSection";
import { CommentsManagementSection } from "@/components/dashboard/CommentsManagementSection";
import { ReportedVideosSection } from "@/components/dashboard/ReportedVideosSection";
import { ContactRequestsSection } from "@/components/dashboard/ContactRequestsSection";
import { ChannelRequestsSection } from "@/components/dashboard/ChannelRequestsSection";
import { GlobalNotificationsSection } from "@/components/dashboard/GlobalNotificationsSection";

export const ContentTab = () => {
  return (
    <div className="space-y-8">
      <YouTubeChannelsSection />
      <MusicArtistsSection />
      <CommentsManagementSection />
      <ReportedVideosSection />
      <ContactRequestsSection />
      <ChannelRequestsSection />
      <GlobalNotificationsSection />
    </div>
  );
};
