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
      
      // Clear local storage to force a refresh from the server
      localStorage.removeItem('supabase.cache.youtube_videos');
      
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*, youtube_channels(thumbnail_url)")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false })
        .limit(150);  // Limit to prevent large dataset issues

      if (error) {
        console.error("Error force refetching videos:", error);
        throw error;
      }

      const formatted = formatVideoData(data);
      setLastSuccessfulFetch(new Date());
      setFetchAttempts(0);
      return formatted;
    } catch (err: any) {
      console.error("Error in force refetch:", err);
      toast.error("Failed to refresh content", {
        description: err.message,
        duration: 5000
      });
      setFetchAttempts(prev => prev + 1);
      return [];
    }
  }, []);

  const fetchAllVideos = async (): Promise<VideoData[]> => {
    try {
      console.log("Fetching all videos");
      
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*, youtube_channels(thumbnail_url)")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false })
        .limit(150);  // Limit to prevent large dataset issues

      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }

      const formatted = formatVideoData(data);
      setLastSuccessfulFetch(new Date());
      setFetchAttempts(0);
      return formatted;

    } catch (err) {
      console.error("Error fetching videos:", err);
      setFetchAttempts(prev => prev + 1);
      throw err;
    }
  };

  return {
    fetchAllVideos,
    forceRefetch,
    fetchAttempts,
    lastSuccessfulFetch,
    setFetchAttempts
  };
};
