
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { UserAnalyticsSection } from "@/components/analytics/UserAnalyticsSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { Card } from "@/components/ui/card";

export const ActivitySection = () => {
  const { isMobile } = useIsMobile();
  const { isAuthenticated } = useUnifiedAuth();
  
  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg rounded-3xl bg-gradient-to-br from-white to-primary/5">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-2xl">
            <div className="w-6 h-6 text-primary">📊</div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-primary">Activity & History</h2>
            <p className="text-sm text-muted-foreground">View your watch history and analytics</p>
          </div>
        </div>
        <VideoHistorySection />
        <UserAnalyticsSection />
      </div>
    </Card>
  );
};
