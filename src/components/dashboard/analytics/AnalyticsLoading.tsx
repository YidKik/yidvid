
import { MessageLoadingDots } from "@/components/ui/loading/MessageLoadingDots";

export const AnalyticsLoading = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <MessageLoadingDots size="medium" text="Loading analytics..." />
    </div>
  );
};
