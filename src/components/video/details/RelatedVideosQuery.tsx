
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
        // First try direct database query for related videos
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

        if (data && data.length > 0) {
          console.log(`Found ${data.length} related videos from the same channel`);
          return data;
        }
        
        // If no videos found or response is empty, try alternative query with video_id instead
        if (!data || data.length === 0) {
          console.log("Trying alternative query with video_id");
          const { data: altData, error: altError } = await supabase
            .from("youtube_videos")
            .select("*")
            .eq("channel_id", channelId)
            .neq("video_id", currentVideoId) // Try with video_id instead
            .is("deleted_at", null)
            .order("uploaded_at", { ascending: false })
            .limit(12);
            
          if (!altError && altData && altData.length > 0) {
            console.log(`Found ${altData.length} related videos from alternative query`);
            return altData;
          }
        }

        // If we couldn't find videos from the same channel, try the edge function as a fallback
        // This is especially important for authenticated users where RLS might be restricting access
        console.log("No videos found from direct queries, trying edge function");
        const response = await fetch(`https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos?channel_id=${channelId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });

        if (!response.ok) {
          throw new Error(`Edge function error: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
          console.log(`Found ${result.data.length} related videos from edge function`);
          // Filter out the current video
          const filteredVideos = result.data.filter(video => 
            video.id !== currentVideoId && 
            video.video_id !== currentVideoId
          );
          
          if (filteredVideos.length > 0) {
            return filteredVideos;
          }
        }

        // As a last resort, try to get any recent videos (not just from this channel)
        console.log("No channel videos found, fetching recent videos as fallback");
        const { data: recentVideos, error: recentError } = await supabase
          .from("youtube_videos")
          .select("*")
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(6);
          
        if (!recentError && recentVideos && recentVideos.length > 0) {
          const filteredRecentVideos = recentVideos.filter(video => 
            video.id !== currentVideoId && 
            video.video_id !== currentVideoId
          );
          
          if (filteredRecentVideos.length > 0) {
            console.log(`Returning ${filteredRecentVideos.length} recent videos as fallback`);
            return filteredRecentVideos;
          }
        }

        console.log("No videos found from any method");
        return [];
      } catch (error) {
        console.error("Error in useRelatedVideosQuery:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
