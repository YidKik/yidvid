
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "./types/video-fetcher";
import { formatVideoData } from "./utils/database";
import { toast } from "sonner";

export const useVideoFetcher = () => {
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);

  const forceRefetch = useCallback(async (): Promise<any> => {
    try {
      console.log("Force refetching all videos...");
      
      // Clear cache to ensure fresh data
      localStorage.removeItem('supabase.cache.youtube_videos');
      
      // Try direct database query with more reliable approach
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*, youtube_channels(thumbnail_url)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(150);
      
      if (error) {
        console.error("Error force refetching videos:", error);
        
        // Fallback to a simpler query if first attempt fails
        const fallbackResult = await supabase
          .from("youtube_videos")
          .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(150);
          
        if (fallbackResult.error) {
          throw fallbackResult.error;
        }
        
        const formatted = formatVideoData(fallbackResult.data);
        setLastSuccessfulFetch(new Date());
        setFetchAttempts(0);
        return formatted;
      }

      const formatted = formatVideoData(data);
      setLastSuccessfulFetch(new Date());
      setFetchAttempts(0);
      return formatted;
    } catch (err: any) {
      console.error("Error in force refetch:", err);
      toast.error("Failed to refresh content", {
        description: "Please check your connection and try again",
        duration: 3000
      });
      setFetchAttempts(prev => prev + 1);
      return [];
    }
  }, []);

  const fetchAllVideos = async (): Promise<VideoData[]> => {
    try {
      console.log("Fetching all videos");
      
      // Skip edge function approach since it's failing
      // Go straight to direct database query
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(150);

        if (error) {
          console.error("Error fetching videos:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.log("No videos found, trying fallback query");
          // Fallback to simpler query
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("youtube_videos")
            .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at")
            .order("created_at", { ascending: false })
            .limit(100);
            
          if (fallbackError) throw fallbackError;
          if (fallbackData && fallbackData.length > 0) {
            const formatted = formatVideoData(fallbackData);
            setLastSuccessfulFetch(new Date());
            setFetchAttempts(0);
            return formatted;
          }
        } else {
          const formatted = formatVideoData(data);
          setLastSuccessfulFetch(new Date());
          setFetchAttempts(0);
          return formatted;
        }
      } catch (dbError) {
        console.error("Database query failed:", dbError);
        // Last resort - return empty array and let sample videos display
        setFetchAttempts(prev => prev + 1);
      }

      return [];
    } catch (err) {
      console.error("Error in fetchAllVideos:", err);
      setFetchAttempts(prev => prev + 1);
      throw err;
    }
  };

  return {
    fetchAllVideos,
    forceRefetch,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts,
    setLastSuccessfulFetch
  };
};
