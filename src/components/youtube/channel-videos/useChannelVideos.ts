
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types/channel-videos";
import { toast } from "sonner";
import { VideoGridError } from "@/components/video/VideoGridError";

export const useChannelVideos = (channelId: string) => {
  return useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      console.log("Fetching videos for channel:", channelId);
      
      try {
        // First attempt: Try direct database access
        try {
          const { data, error } = await supabase
            .from("youtube_videos")
            .select("*")
            .eq("channel_id", channelId)
            .is("deleted_at", null)
            .order("uploaded_at", { ascending: false });
              
          if (error) {
            console.error("Error fetching channel videos:", error);
            throw error;
          }
          
          console.log(`Successfully fetched ${data?.length || 0} videos for channel ${channelId}`);
          
          if (data && data.length > 0) {
            return data as Video[];
          }
        } catch (directError) {
          console.error("Direct fetch error:", directError);
          // Continue to fallback method
        }
        
        // Second attempt: Try edge function as fallback (bypassing profile recursion)
        try {
          console.log("Attempting to fetch videos via edge function");
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
          console.log("Edge function response:", result);
          
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            return result.data as Video[];
          }
          
          if (result.videos && Array.isArray(result.videos)) {
            return result.videos as Video[];
          }
        } catch (edgeFunctionError) {
          console.error("Edge function fetch error:", edgeFunctionError);
          // Continue to final attempt
        }
        
        // If we reached this point, no videos were found
        throw new Error("No videos found for this channel");
      } catch (error: any) {
        console.error("Error in channel videos query:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      suppressToasts: true // Don't show toast notifications
    }
  });
};
