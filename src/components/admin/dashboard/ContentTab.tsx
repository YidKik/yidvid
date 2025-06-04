
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { YouTubeChannelsSection } from "@/components/dashboard/YouTubeChannelsSection";
import { MusicArtistsSection } from "@/components/dashboard/MusicArtistsSection";
import { CommentsManagementSection } from "@/components/dashboard/CommentsManagementSection";
import { ReportedVideosSection } from "@/components/dashboard/ReportedVideosSection";
import { ContactRequestsSection } from "@/components/dashboard/ContactRequestsSection";
import { ChannelRequestsSection } from "@/components/dashboard/ChannelRequestsSection";
import { GlobalNotificationsSection } from "@/components/dashboard/GlobalNotificationsSection";

export const ContentTab = () => {
  const [isReportedVideosOpen, setIsReportedVideosOpen] = useState(false);

  return (
    <div className="space-y-8">
      <YouTubeChannelsSection />
      <MusicArtistsSection />
      <CommentsManagementSection />
      
      {/* Reported Videos Section with Button Trigger */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Reported Videos
          </h2>
          <Button onClick={() => setIsReportedVideosOpen(true)}>
            View Reports
          </Button>
        </div>
      </div>
      
      <ContactRequestsSection />
      <ChannelRequestsSection />
      <GlobalNotificationsSection />

      {/* Reported Videos Dialog */}
      <ReportedVideosSection 
        isOpen={isReportedVideosOpen} 
        onClose={() => setIsReportedVideosOpen(false)} 
      />
    </div>
  );
};
