
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types/channel-videos";
import { toast } from "sonner";

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
            toast.warning(message);
          }
        } catch (error) {
          console.warn("Error checking quota:", error);
          // Continue execution - this is non-critical
        }

        // Fetch videos from our database (these are cached)
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          throw error;
        }

        console.log("Fetched videos:", data?.length || 0);
        return data as Video[];
      } catch (error: any) {
        // Enhance error message for quota exceeded
        if (error.message?.includes('quota exceeded')) {
          const enhancedError = new Error('Daily YouTube API quota exceeded. Only cached videos are available.');
          console.error(enhancedError);
          toast.error(enhancedError.message);
          // Return empty array instead of throwing
          return [];
        }

        console.error("Error in queryFn:", error);
        throw new Error(error.message || "Failed to fetch videos");
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
  });
};
