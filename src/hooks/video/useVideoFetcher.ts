
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
      
      // Add delay before fetch to ensure cache is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try direct database query with explicit sorting
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(50); // Reduced from 150 to improve performance
        
        if (!error && data && data.length > 0) {
          console.log(`Successfully fetched ${data.length} videos directly from database`);
          const formatted = formatVideoData(data);
          setLastSuccessfulFetch(new Date());
          setFetchAttempts(0);
          return formatted;
        }
      } catch (directError) {
        console.error("Direct database query failed:", directError);
      }
      
      // Fallback query with simplified fields
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false })
        .limit(50); // Reduced from 100 to improve performance
        
      if (fallbackError) {
        throw fallbackError;
      }
      
      console.log(`Fallback query successful, retrieved ${fallbackData?.length || 0} videos`);
      const formatted = formatVideoData(fallbackData);
      setLastSuccessfulFetch(new Date());
      setFetchAttempts(0);
      return formatted;
      
    } catch (err: any) {
      console.error("Error in force refetch:", err);
      
      // Only show toast for actual errors, not just empty results
      if (err.message && err.message !== "No videos found") {
        toast.error("Failed to refresh content", {
          description: err.code === "42P17" ? "Database permission issue. Please try again later." : err.message,
          duration: 3000
        });
      }
      
      setFetchAttempts(prev => prev + 1);
      return [];
    }
  }, []);

  const fetchAllVideos = async (): Promise<VideoData[]> => {
    try {
      console.log("Fetching all videos");
      
      // Try simplified query with fewer fields for better performance
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false })
        .limit(50); // Reduced from 150 to improve performance

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("No videos found");
      }

      const formatted = formatVideoData(data);
      setLastSuccessfulFetch(new Date());
      setFetchAttempts(prev => Math.max(0, prev - 1)); // Reduce attempt count on success
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
    setFetchAttempts,
    setLastSuccessfulFetch
  };
};
