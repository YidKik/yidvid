
import { VideoHistorySection } from "@/components/history/VideoHistorySection";
import { UserAnalyticsSection } from "@/components/analytics/UserAnalyticsSection";

export const ActivitySection = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-primary/80">Activity & History</h2>
      <VideoHistorySection />
      <UserAnalyticsSection />
    </div>
  );
};
