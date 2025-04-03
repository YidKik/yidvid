
import { Loader2 } from "lucide-react";

/**
 * Loading state for the dashboard
 */
export const DashboardLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};
