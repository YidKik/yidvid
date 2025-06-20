
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useRelatedVideosQuery = (channelId: string, currentVideoId: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["channel-videos", channelId, currentVideoId, isAuthenticated],
    enabled: !!channelId && !!currentVideoId,
    queryFn: async () => {
      console.log("Fetching related videos for channel:", channelId, "excluding video:", currentVideoId);
      console.log("Auth status:", isAuthenticated ? "logged in" : "logged out");
      
      try {
        // Try direct database query first using the video's UUID id
        let { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .neq("id", currentVideoId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(12);

        if (error) {
          console.error("Error fetching related videos with UUID:", error);
        }

        // If we found videos, return them
        if (data && data.length > 0) {
          console.log(`Found ${data.length} related videos using UUID exclusion`);
          return data;
        }
        
        // Try excluding by video_id instead of UUID
        console.log("No videos found with UUID exclusion, trying video_id exclusion");
        const { data: videoIdData, error: videoIdError } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .neq("video_id", currentVideoId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(12);
            
        if (videoIdError) {
          console.error("Error fetching related videos with video_id:", videoIdError);
        }

        if (videoIdData && videoIdData.length > 0) {
          console.log(`Found ${videoIdData.length} related videos using video_id exclusion`);
          return videoIdData;
        }

        // Try without any exclusion to see if there are ANY videos from this channel
        console.log("No videos found with exclusions, checking if channel has any videos");
        const { data: allChannelData, error: allChannelError } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(12);

        if (allChannelError) {
          console.error("Error fetching all channel videos:", allChannelError);
        }

        if (allChannelData && allChannelData.length > 0) {
          console.log(`Found ${allChannelData.length} total videos from channel, filtering current video`);
          // Filter out current video manually
          const filteredVideos = allChannelData.filter(video => 
            video.id !== currentVideoId && video.video_id !== currentVideoId
          );
          
          if (filteredVideos.length > 0) {
            console.log(`Returning ${filteredVideos.length} filtered videos`);
            return filteredVideos;
          }
        }

        // If still no videos, try the edge function as final fallback
        console.log("No direct database results, trying edge function");
        const edgeFunctionUrl = `https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos?channel_id=${channelId}`;
        console.log("Calling edge function:", edgeFunctionUrl);
        
        const response = await fetch(edgeFunctionUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });

        if (!response.ok) {
          console.error(`Edge function error: ${response.statusText}`);
          return [];
        }
        
        const result = await response.json();
        
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          console.log(`Found ${result.data.length} related videos from edge function`);
          // Filter out the current video
          const filteredVideos = result.data.filter(video => 
            video.id !== currentVideoId && 
            video.video_id !== currentVideoId
          );
          
          if (filteredVideos.length > 0) {
            console.log(`Returning ${filteredVideos.length} filtered edge function videos`);
            return filteredVideos;
          }
        }

        console.log("No videos found from this channel");
        return [];
      } catch (error) {
        console.error("Error in useRelatedVideosQuery:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
