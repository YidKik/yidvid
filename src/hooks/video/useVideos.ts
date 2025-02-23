
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number;
  uploadedAt: string | Date;
}

export const useVideos = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('youtube_videos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_videos'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Invalidate and refetch when we get a real-time update
          queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data, isLoading, isFetching, error, refetch } = useQuery<Video[]>({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      console.log("Fetching videos...");
      
      try {
        // First fetch existing videos from database
        let videosData = [];
        const { data: initialData, error: dbError } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false });

        if (dbError) {
          console.error("Error fetching videos from database:", dbError);
          throw dbError;
        }

        videosData = initialData || [];

        // Get channels to process
        const { data: channels, error: channelError } = await supabase
          .from("youtube_channels")
          .select("channel_id")
          .is("deleted_at", null);

        if (channelError) {
          console.error("Error fetching channels:", channelError);
          throw channelError;
        }

        const channelIds = channels?.map(c => c.channel_id) || [];
        console.log(`Found ${channelIds.length} channels to process`);

        // Try to fetch new videos
        try {
          const { data: response } = await supabase.functions.invoke('fetch-youtube-videos', {
            body: { 
              channels: channelIds,
              forceUpdate: true
            }
          });

          if (response?.success) {
            toast.success(`Successfully processed ${response.processed} channels, found ${response.newVideos} new videos`);
            
            // Refetch videos from database after successful update
            const { data: updatedData, error: updateError } = await supabase
              .from("youtube_videos")
              .select("*")
              .is('deleted_at', null)
              .order("uploaded_at", { ascending: false });

            if (!updateError && updatedData) {
              videosData = updatedData;
            }
          } else if (response?.quota_reset_at) {
            const resetTime = new Date(response.quota_reset_at);
            toast.warning(`YouTube quota exceeded. Service will resume at ${resetTime.toLocaleString()}`);
          }
        } catch (fetchError) {
          console.error('Error fetching new videos:', fetchError);
          toast.error('Could not fetch new videos, showing existing data');
        }

        // Format and return the data we have
        const formattedData = videosData.map(video => ({
          id: video.id,
          video_id: video.video_id,
          title: video.title,
          thumbnail: video.thumbnail,
          channelName: video.channel_name,
          channelId: video.channel_id,
          views: video.views || 0,
          uploadedAt: video.uploaded_at
        }));

        console.log(`Successfully processed ${formattedData.length} videos`);
        return formattedData;

      } catch (error: any) {
        console.error("Error in video fetching process:", error);

        // Try to get cached data first
        const cachedData = queryClient.getQueryData<Video[]>(["youtube_videos"]);
        if (cachedData?.length) {
          toast.warning('Error fetching videos. Showing cached data.');
          return cachedData;
        }

        // If all else fails
        toast.error('Error loading videos. Please try again later.');
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
    gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on quota exceeded
      if (error?.status === 429) return false;
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000), // Exponential backoff
  });

  return {
    data: data || [],
    isLoading,
    isFetching,
    error,
    refetch
  };
};
