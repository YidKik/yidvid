
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Calendar } from "lucide-react";
import { AnalyticsStats } from "@/hooks/useAnalyticsData";

interface UserStatsCardsProps {
  stats?: AnalyticsStats;
  isLoading?: boolean;
}

export const UserStatsCards = ({ stats, isLoading }: UserStatsCardsProps) => {
  // Default values in case stats is undefined
  const activeUsers = stats?.activeUsers ?? 0;
  const weeklyUsers = stats?.weeklyUsers ?? 0;
  const monthlyUsers = stats?.monthlyUsers ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-blue-50 border-blue-200 shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold">Active Users</CardTitle>
            <CardDescription>Currently viewing the site</CardDescription>
          </div>
          <Users className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-700">
            {isLoading ? "Loading..." : activeUsers}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200 shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold">Weekly Users</CardTitle>
            <CardDescription>Past 7 days</CardDescription>
          </div>
          <Clock className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-700">
            {isLoading ? "Loading..." : weeklyUsers}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200 shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold">Monthly Users</CardTitle>
            <CardDescription>This month</CardDescription>
          </div>
          <Calendar className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-purple-700">
            {isLoading ? "Loading..." : monthlyUsers}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
