import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export const DeviceBreakdown = () => {
  const { data, isLoading, error } = useGoogleAnalytics({ metricType: 'devices' });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load device data</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.rows?.map((row: any) => ({
    device: row.dimensionValues[0]?.value || 'Unknown',
    sessions: parseInt(row.metricValues[0]?.value || '0'),
    users: parseInt(row.metricValues[1]?.value || '0'),
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="device" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Sessions" />
            <Bar dataKey="users" fill="hsl(var(--secondary))" name="Users" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
