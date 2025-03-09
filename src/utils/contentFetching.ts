
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches initial content data for all users regardless of authentication status
 */
export function fetchInitialContent(queryClient: QueryClient) {
  console.log("Prefetching initial content data for all users");
  
  // Prefetch videos with high priority
  queryClient.prefetchQuery({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(200);
          
        if (error) {
          console.error("Error prefetching videos:", error);
          
          // If permission denied or policy error, try more basic query
          if (error.message.includes("permission") || error.message.includes("policy") || error.message.includes("recursion")) {
            console.log("Trying simplified video query after permission error");
            const basicQuery = await supabase
              .from("youtube_videos")
              .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
              .order("uploaded_at", { ascending: false })
              .limit(50);
              
            if (!basicQuery.error && basicQuery.data?.length > 0) {
              console.log(`Received ${basicQuery.data.length} videos from simplified query`);
              return basicQuery.data;
            }
          }
          
          return [];
        }
        
        console.log(`Initial content fetch: Got ${data?.length || 0} videos`);
        return data || [];
      } catch (err) {
        console.error("Error in initial video fetch:", err);
        return [];
      }
    },
    staleTime: 30000 // 30 seconds
  });
  
  // Prefetch channels with high priority
  queryClient.prefetchQuery({
    queryKey: ["youtube_channels"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .is("deleted_at", null)
          .limit(50);
          
        if (error) {
          console.error("Error prefetching channels:", error);
          
          // If permission denied or policy error, try more basic query
          if (error.message.includes("permission") || error.message.includes("policy") || error.message.includes("recursion")) {
            console.log("Trying simplified channel query after permission error");
            const basicQuery = await supabase
              .from("youtube_channels")
              .select("id, channel_id, title, thumbnail_url")
              .limit(50);
              
            if (!basicQuery.error && basicQuery.data?.length > 0) {
              console.log(`Received ${basicQuery.data.length} channels from simplified query`);
              return basicQuery.data;
            }
          }
          
          return [];
        }
        
        console.log(`Initial content fetch: Got ${data?.length || 0} channels`);
        return data || [];
      } catch (err) {
        console.error("Error in initial channel fetch:", err);
        return [];
      }
    },
    staleTime: 30000 // 30 seconds
  });
}
