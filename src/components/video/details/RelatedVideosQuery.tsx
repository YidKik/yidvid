
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
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("channel_id", channelId)
          .neq("id", currentVideoId)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(12);

        if (error) {
          console.error("Error fetching related videos:", error);
          throw error;
        }

        if (data && data.length > 0) {
          console.log(`Found ${data.length} related videos from the same channel`);
          return data;
        }

        // If we couldn't find videos from the same channel, try the edge function as a fallback
        // This is especially important for authenticated users where RLS might be restricting access
        console.log("No videos found from direct query, trying edge function");
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
          const filteredVideos = result.data.filter(video => video.id !== currentVideoId);
          return filteredVideos;
        }

        console.log("No videos found from either method");
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
