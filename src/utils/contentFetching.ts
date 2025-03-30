
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
            // Fetch a minimal set of videos first (reduced to just 10 for speed)
            const { data, error } = await supabase
              .from("youtube_videos")
              .select("id, video_id, title, thumbnail")
              .is("deleted_at", null)
              .order("uploaded_at", { ascending: false })
              .limit(10);
              
            if (error) {
              console.error("Error prefetching videos:", error);
              return [];
            }
            
            console.log(`Initial content fetch: Got ${data?.length || 0} videos`);
            return data || [];
          } catch (err) {
            console.error("Error in initial video fetch:", err);
            return [];
          }
        },
        staleTime: 10000, // 10 seconds
        meta: {
          suppressToasts: true
        }
      });
      
      // Simple query for channels - minimal fields for speed
      queryClient.prefetchQuery({
        queryKey: ["youtube_channels"],
        queryFn: async () => {
          try {
            const { data, error } = await supabase
              .from("youtube_channels")
              .select("id, channel_id, title")
              .is("deleted_at", null)
              .limit(10);
              
            if (error) {
              console.error("Error prefetching channels:", error);
              return [];
            }
            
            console.log(`Initial content fetch: Got ${data?.length || 0} channels`);
            return data || [];
          } catch (err) {
            console.error("Error in initial channel fetch:", err);
            return [];
          }
        },
        staleTime: 10000, // 10 seconds
        meta: {
          suppressToasts: true
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
