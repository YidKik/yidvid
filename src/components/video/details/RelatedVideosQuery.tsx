
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
        // Only try direct database query for videos from the same channel
        let { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .neq("id", currentVideoId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(12);

        if (error) {
          console.error("Error fetching related videos from database:", error);
          throw error;
        }

        // If we found videos from the channel, return them
        if (data && data.length > 0) {
          console.log(`Found ${data.length} related videos from the same channel`);
          return data;
        }
        
        // Second attempt: try with video_id instead of id for current video exclusion
        console.log("No videos found with ID match, trying video_id exclusion");
        const { data: videoIdData, error: videoIdError } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .neq("video_id", currentVideoId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(12);
            
        if (!videoIdError && videoIdData && videoIdData.length > 0) {
          console.log(`Found ${videoIdData.length} related videos using video_id exclusion`);
          return videoIdData;
        }
        
        // If still no videos from direct queries, try the edge function for this specific channel
        console.log("No videos found from direct queries, trying edge function for channel");
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
          throw new Error(`Edge function error: ${response.statusText}`);
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
            console.log(`Returning ${filteredVideos.length} filtered channel videos`);
            return filteredVideos;
          }
        }

        // NO FALLBACK - only return channel videos or empty array
        console.log("No videos found from this channel - returning empty array");
        return [];
      } catch (error) {
        console.error("Error in useRelatedVideosQuery:", error);
        // No fallback - return empty array if there's an error
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
