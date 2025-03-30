
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches initial content data for all users regardless of authentication status
 * Optimized for faster initial rendering
 * @returns A Promise that resolves when prefetching has started
 */
export function fetchInitialContent(queryClient: QueryClient): Promise<void> {
  console.log("Prefetching minimal initial content data for faster loading");
  
  // Return a Promise that can be properly caught
  return new Promise<void>((resolve, reject) => {
    try {
      // Prefetch a small batch of videos with high priority
      queryClient.prefetchQuery({
        queryKey: ["youtube_videos"],
        queryFn: async () => {
          try {
            // Fetch a minimal set of videos first (reduced from 200 to 20)
            const { data, error } = await supabase
              .from("youtube_videos")
              .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
              .is("deleted_at", null)
              .order("uploaded_at", { ascending: false })
              .limit(20);
              
            if (error) {
              console.error("Error prefetching videos:", error);
              
              // If permission denied or policy error, try more basic query with fewer fields
              if (error.message.includes("permission") || error.message.includes("policy") || error.message.includes("recursion")) {
                console.log("Trying simplified video query after permission error");
                const basicQuery = await supabase
                  .from("youtube_videos")
                  .select("id, video_id, title, thumbnail")
                  .order("uploaded_at", { ascending: false })
                  .limit(12);
                  
                if (!basicQuery.error && basicQuery.data?.length > 0) {
                  console.log(`Received ${basicQuery.data.length} videos from simplified query`);
                  return basicQuery.data;
                }
              }
              
              return [];
            }
            
            console.log(`Initial content fetch: Got ${data?.length || 0} videos`);
            
            // Start a background fetch for more videos 
            setTimeout(() => {
              console.log("Starting background fetch for more videos");
              queryClient.fetchQuery({ 
                queryKey: ["youtube_videos_full"],
                queryFn: async () => {
                  try {
                    const { data: fullData } = await supabase
                      .from("youtube_videos")
                      .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, category, description")
                      .is("deleted_at", null)
                      .order("uploaded_at", { ascending: false })
                      .limit(100);
                      
                    if (fullData && fullData.length > 0) {
                      console.log(`Background fetch: Got ${fullData.length} full videos`);
                      // Update the main videos cache with the full data
                      queryClient.setQueryData(["youtube_videos"], fullData);
                    }
                    return fullData || [];
                  } catch (err) {
                    console.error("Error in background video fetch:", err);
                    return [];
                  }
                },
                meta: {
                  suppressToasts: true // Don't show toast notifications
                }
              });
            }, 2000);
            
            return data || [];
          } catch (err) {
            console.error("Error in initial video fetch:", err);
            return [];
          }
        },
        staleTime: 30000, // 30 seconds
        meta: {
          suppressToasts: true // Don't show toast notifications
        }
      });
      
      // Prefetch a small set of channels with high priority
      queryClient.prefetchQuery({
        queryKey: ["youtube_channels"],
        queryFn: async () => {
          try {
            // Reduced from 50 to 10 for faster initial loading
            const { data, error } = await supabase
              .from("youtube_channels")
              .select("id, channel_id, title, thumbnail_url")
              .is("deleted_at", null)
              .limit(10);
              
            if (error) {
              console.error("Error prefetching channels:", error);
              
              // If permission denied or policy error, try more basic query
              if (error.message.includes("permission") || error.message.includes("policy") || error.message.includes("recursion")) {
                console.log("Trying simplified channel query after permission error");
                const basicQuery = await supabase
                  .from("youtube_channels")
                  .select("id, channel_id, title")
                  .limit(10);
                  
                if (!basicQuery.error && basicQuery.data?.length > 0) {
                  console.log(`Received ${basicQuery.data.length} channels from simplified query`);
                  return basicQuery.data;
                }
              }
              
              return [];
            }
            
            console.log(`Initial content fetch: Got ${data?.length || 0} channels`);
            
            // Start a background fetch for more channels
            setTimeout(() => {
              console.log("Starting background fetch for more channels");
              queryClient.fetchQuery({ 
                queryKey: ["youtube_channels_full"],
                queryFn: async () => {
                  try {
                    const { data: fullData } = await supabase
                      .from("youtube_channels")
                      .select("id, channel_id, title, thumbnail_url, description")
                      .is("deleted_at", null)
                      .limit(50);
                      
                    if (fullData && fullData.length > 0) {
                      console.log(`Background fetch: Got ${fullData.length} full channels`);
                      // Update the main channels cache with the full data
                      queryClient.setQueryData(["youtube_channels"], fullData);
                    }
                    return fullData || [];
                  } catch (err) {
                    console.error("Error in background channel fetch:", err);
                    return [];
                  }
                },
                meta: {
                  suppressToasts: true // Don't show toast notifications
                }
              });
            }, 3000);
            
            return data || [];
          } catch (err) {
            console.error("Error in initial channel fetch:", err);
            return [];
          }
        },
        staleTime: 30000, // 30 seconds
        meta: {
          suppressToasts: true // Don't show toast notifications
        }
      });

      // Since we've started the prefetching processes, resolve the promise
      resolve();
    } catch (err) {
      console.error("Error initiating content prefetch:", err);
      reject(err);
    }
  });
}
