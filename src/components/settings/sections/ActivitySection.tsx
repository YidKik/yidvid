
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { UserAnalyticsSection } from "@/components/analytics/UserAnalyticsSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { History, BarChart3, TrendingUp } from "lucide-react";

export const ActivitySection = () => {
  const { isMobile } = useIsMobile();
  const { isAuthenticated } = useUnifiedAuth();
  
  return (
    <div style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
        <div className="p-1.5 bg-yellow-100 rounded-lg">
          <TrendingUp size={16} className="text-yellow-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Activity & History</h2>
          <p className="text-xs text-gray-500">Track your viewing activity and stats</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Analytics Stats Cards */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-red-500" />
            <h3 className="text-sm font-semibold text-gray-800">Your Stats</h3>
          </div>
          <UserAnalyticsSection />
        </div>

        {/* Watch History */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <History size={14} className="text-red-500" />
            <h3 className="text-sm font-semibold text-gray-800">Watch History</h3>
          </div>
          <VideoHistorySection />
        </div>
      </div>
    </div>
  );
};
