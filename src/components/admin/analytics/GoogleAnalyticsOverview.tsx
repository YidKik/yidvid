import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, Activity, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const GoogleAnalyticsOverview = () => {
  const { data, isLoading, error } = useGoogleAnalytics({ metricType: 'overview' });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Failed to load Google Analytics data. Please check your configuration.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate totals from GA data
  const totals = data?.rows?.reduce((acc: any, row: any) => {
    const metrics = row.metricValues;
    return {
      activeUsers: (acc.activeUsers || 0) + parseInt(metrics[0]?.value || '0'),
      sessions: (acc.sessions || 0) + parseInt(metrics[1]?.value || '0'),
      pageViews: (acc.pageViews || 0) + parseInt(metrics[2]?.value || '0'),
      engagementRate: parseFloat(metrics[3]?.value || '0'),
    };
  }, {}) || { activeUsers: 0, sessions: 0, pageViews: 0, engagementRate: 0 };

  const stats = [
    {
      title: 'Active Users',
      value: totals.activeUsers.toLocaleString(),
      icon: Users,
      description: 'Total active users',
    },
    {
      title: 'Sessions',
      value: totals.sessions.toLocaleString(),
      icon: Activity,
      description: 'Total sessions',
    },
    {
      title: 'Page Views',
      value: totals.pageViews.toLocaleString(),
      icon: Eye,
      description: 'Total page views',
    },
    {
      title: 'Engagement Rate',
      value: `${(totals.engagementRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Average engagement',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
