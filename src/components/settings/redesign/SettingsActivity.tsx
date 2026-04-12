import { UserAnalyticsSection } from "@/components/analytics/UserAnalyticsSection";
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { BarChart3, History } from "lucide-react";

export const SettingsActivity = () => {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-[#FF0000]" />
          <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#e8e8e8]">Your Stats</h3>
        </div>
        <UserAnalyticsSection />
      </div>

      {/* Watch History */}
      <div className="border-t border-[#E5E5E5] dark:border-[#333] pt-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-[#FF0000]" />
          <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#e8e8e8]">Watch History</h3>
        </div>
        <VideoHistorySection />
      </div>
    </div>
  );
};
