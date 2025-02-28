
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
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
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);

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
          queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
        }
      )
      .subscribe();

    // Also subscribe to category mapping changes
    const categoryMappingChannel = supabase
      .channel('category_mapping_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_custom_category_mappings'
        },
        (payload) => {
          console.log('Category mapping changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
          queryClient.invalidateQueries({ queryKey: ["category-videos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(categoryMappingChannel);
    };
  }, [queryClient]);

  const checkApiQuota = async () => {
    try {
      const { data, error } = await supabase
        .from("api_quota_tracking")
        .select("*")
        .eq("api_name", "youtube")
        .single();

      if (error) {
        console.error("Error checking API quota:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Failed to check API quota:", err);
      return null;
    }
  };

  const fetchAllVideos = async () => {
    console.log("Starting video fetch process...");
    
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

      // Get all active channels
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

      // Check if we have recent video data or need to fetch fresh data
      const shouldFetchNewVideos = lastSuccessfulFetch === null || 
                                 (Date.now() - lastSuccessfulFetch.getTime() > 3600000) || // 1 hour
                                 fetchAttempts > 0; // Also fetch if we've had previous attempts

      if (channelIds.length > 0 && shouldFetchNewVideos) {
        // Check quota before making requests
        const quotaInfo = await checkApiQuota();
        
        if (quotaInfo && quotaInfo.quota_remaining <= 0) {
          const resetTime = new Date(quotaInfo.quota_reset_at);
          toast.warning(`YouTube quota exceeded. Service will resume at ${resetTime.toLocaleString()}`);
        } else {
          try {
            // Trigger edge function to fetch new videos
            const { data: response, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
              body: { 
                channels: channelIds,
                forceUpdate: fetchAttempts > 2, // Force update if we've had multiple attempts
                fullScan: true // Add parameter to force full scan of channels for missed videos
              }
            });

            if (fetchError) {
              console.error('Error invoking fetch-youtube-videos:', fetchError);
              setFetchAttempts(prev => prev + 1);
              
              // Continue with existing data rather than failing completely
              console.log('Using existing video data due to fetch error');
            } else {
              console.log('Fetch response:', response);
              setFetchAttempts(0);
              setLastSuccessfulFetch(new Date());

              if (response?.success) {
                toast.success(`Successfully processed ${response.processed} channels, found ${response.newVideos} new videos`);
                
                // Refetch videos after successful update
                const { data: updatedData, error: updateError } = await supabase
                  .from("youtube_videos")
                  .select("*")
                  .is('deleted_at', null)
                  .order("uploaded_at", { ascending: false });

                if (updateError) {
                  console.error('Error fetching updated videos:', updateError);
                } else if (updatedData) {
                  videosData = updatedData;
                }
              } else if (response?.quota_reset_at) {
                const resetTime = new Date(response.quota_reset_at);
                toast.warning(`YouTube quota exceeded. Service will resume at ${resetTime.toLocaleString()}`);
              }
            }
          } catch (invocationError) {
            console.error('Failed to invoke function:', invocationError);
            setFetchAttempts(prev => prev + 1);
            // Continue with existing data
          }
        }
      }

      // Format and return the data, even if the fetch failed
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
      toast.error('Error loading videos. Please try again later.');
      throw error;
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery<Video[]>({
    queryKey: ["youtube_videos"],
    queryFn: fetchAllVideos,
    refetchInterval: fetchAttempts > 3 ? 60000 : 30000, // Adjust refetch interval based on failure count
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

  // Force an immediate fetch when mounted
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data: data || [],
    isLoading,
    isFetching,
    error,
    refetch,
    lastSuccessfulFetch,
    fetchAttempts
  };
};
