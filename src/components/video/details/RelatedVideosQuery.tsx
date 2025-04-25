
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
        // First try direct database query for related videos by channel ID
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

        // If we found videos, return them
        if (data && data.length > 0) {
          console.log(`Found ${data.length} related videos from the same channel`);
          return data;
        }
        
        // Second attempt: try with video_id instead of id
        console.log("No videos found with ID match, trying video_id");
        const { data: videoIdData, error: videoIdError } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .neq("video_id", currentVideoId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(12);
            
        if (!videoIdError && videoIdData && videoIdData.length > 0) {
          console.log(`Found ${videoIdData.length} related videos using video_id match`);
          return videoIdData;
        }
        
        // If still no videos, try the edge function approach
        console.log("No videos found from direct queries, trying edge function");
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
        
        // One final attempt: Try the public endpoint with no authentication
        try {
          console.log("Attempting final fallback: public videos endpoint");
          const publicResponse = await fetch("https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
            }
          });
          
          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            if (publicData.data && Array.isArray(publicData.data) && publicData.data.length > 0) {
              console.log(`Found ${publicData.data.length} videos from public endpoint`);
              return publicData.data;
            }
          }
        } catch (fallbackError) {
          console.error("Error in fallback attempt:", fallbackError);
        }
        
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Added retry for better reliability
  });
};
