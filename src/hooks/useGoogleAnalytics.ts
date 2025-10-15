import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type MetricType = 'overview' | 'realtime' | 'traffic' | 'pages' | 'devices' | 'geography';
export type DateRange = '7daysAgo' | '30daysAgo' | '90daysAgo';

interface UseGoogleAnalyticsProps {
  metricType: MetricType;
  dateRange?: DateRange;
  enabled?: boolean;
}

export const useGoogleAnalytics = ({ 
  metricType, 
  dateRange = '7daysAgo',
  enabled = true 
}: UseGoogleAnalyticsProps) => {
  return useQuery({
    queryKey: ['google-analytics', metricType, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-ga-analytics', {
        body: { metricType, dateRange }
      });

      if (error) throw error;
      return data;
    },
    enabled,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
  });
};
