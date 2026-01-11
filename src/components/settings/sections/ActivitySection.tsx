import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { UserAnalyticsSection } from "@/components/analytics/UserAnalyticsSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { History, BarChart3 } from "lucide-react";

export const ActivitySection = () => {
  const { isMobile } = useIsMobile();
  const { isAuthenticated } = useUnifiedAuth();
  
  return (
    <div style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
        <History size={18} className="text-yellow-600" />
        <h2 className="text-lg font-bold text-gray-900">Activity & History</h2>
      </div>
      
      <div className="space-y-6">
        {/* Watch History */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-800">Watch History</h3>
          </div>
          <VideoHistorySection />
        </div>
        
        {/* Analytics */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">Your Analytics</h3>
          </div>
          <UserAnalyticsSection />
        </div>
      </div>
    </div>
  );
};
