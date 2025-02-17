
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { BackButton } from "@/components/navigation/BackButton";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Dashboard Analytics</h1>
      <DashboardAnalytics />
    </div>
  );
}
