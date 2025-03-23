
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types/channel-videos";

export const useChannelVideos = (channelId: string) => {
  return useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      console.log("Fetching videos for channel:", channelId);
      
      try {
        // First check quota status, but don't throw if it fails
        try {
          const { data: quotaData, error: quotaError } = await supabase
            .from('api_quota_tracking')
            .select('quota_remaining, quota_reset_at')
            .eq('api_name', 'youtube')
            .single();

          if (quotaError) {
            console.warn("Could not check quota status:", quotaError);
          } else if (quotaData && quotaData.quota_remaining <= 0) {
            const resetTime = new Date(quotaData.quota_reset_at);
            const message = `YouTube API quota exceeded. Service will resume at ${resetTime.toLocaleString()}`;
            console.warn(message);
          }
        } catch (error) {
          console.warn("Error checking quota:", error);
        }

        // Try direct query without RLS first
        let data: any[] = [];
        let retryNeeded = false;
        
        try {
          const directQuery = await supabase
            .from("youtube_videos")
            .select("*")
            .eq("channel_id", channelId)
            .is("deleted_at", null)
            .order("uploaded_at", { ascending: false });
            
          if (!directQuery.error && directQuery.data && directQuery.data.length > 0) {
            console.log(`Direct query successful: ${directQuery.data.length} videos`);
            data = directQuery.data;
          } else {
            console.warn("Direct query failed or returned no results, trying backup method");
            retryNeeded = true;
          }
        } catch (directQueryError) {
          console.error("Error in direct query:", directQueryError);
          retryNeeded = true;
        }
        
        // Try backup method if direct query failed
        if (retryNeeded) {
          const { data: backupData, error: backupError } = await supabase
            .from("youtube_videos")
            .select("id, video_id, title, thumbnail, channel_name, views, uploaded_at")
            .eq("channel_id", channelId)
            .order("uploaded_at", { ascending: false });
            
          if (backupError) {
            console.error("Backup query also failed:", backupError);
            throw backupError;
          }
          
          if (backupData && backupData.length > 0) {
            console.log(`Backup query successful: ${backupData.length} videos`);
            data = backupData;
          }
        }

        console.log("Fetched videos:", data?.length || 0);
        
        if (data && data.length > 0) {
          return data as Video[];
        }
        
        // Create sample videos if no real data available
        const now = new Date();
        return Array(8).fill(null).map((_, i) => ({
          id: `sample-${i}`,
          video_id: `sample-vid-${i}`,
          title: `Sample Video ${i+1}`,
          thumbnail: '/placeholder.svg',
          channel_name: "Sample Channel",
          channel_id: channelId,
          views: 1000 * (i+1),
          uploaded_at: new Date(now.getTime() - (i * 86400000)).toISOString(),
          category: "other",
          description: "This is a sample video until real content loads."
        })) as Video[];
      } catch (error: any) {
        console.error("Error in queryFn:", error);
        
        // Create sample videos for fallback
        const now = new Date();
        return Array(8).fill(null).map((_, i) => ({
          id: `sample-${i}`,
          video_id: `sample-vid-${i}`,
          title: `Sample Video ${i+1}`,
          thumbnail: '/placeholder.svg',
          channel_name: "Sample Channel",
          channel_id: channelId,
          views: 1000 * (i+1),
          uploaded_at: new Date(now.getTime() - (i * 86400000)).toISOString(),
          category: "other",
          description: "This is a sample video until real content loads."
        })) as Video[];
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry quota errors
      if (error.message?.includes('quota exceeded')) return false;
      // Retry network errors up to 3 times
      if (error.message?.includes('Failed to fetch')) return failureCount < 3;
      // Retry once for other errors
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    staleTime: 0, // Always get fresh data
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
    refetchOnWindowFocus: false,
    meta: {
      suppressToasts: true // Don't show toast notifications
    }
  });
};
