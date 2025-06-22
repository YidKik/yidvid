
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { UserAnalyticsSection } from "@/components/analytics/UserAnalyticsSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

export const ActivitySection = () => {
  const { isMobile } = useIsMobile();
  const { isAuthenticated } = useUnifiedAuth();
  
  return (
    <div className="space-y-6 md:space-y-8">
      <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold text-primary/80`}>Activity & History</h2>
      <VideoHistorySection />
      <UserAnalyticsSection />
    </div>
  );
};
