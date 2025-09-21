
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
      
      // Rate limiting - only allow one refetch per 10 minutes
      const lastRefetch = localStorage.getItem('lastForceRefetch');
      const now = Date.now();
      if (lastRefetch && (now - parseInt(lastRefetch)) < 600000) { // 10 minutes
        console.log("Skipping refetch - too recent");
        return [];
      }
      localStorage.setItem('lastForceRefetch', now.toString());
      
      console.log("Using direct database query only...");
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .is("deleted_at", null)
        .eq("content_analysis_status", "approved")
        .order("uploaded_at", { ascending: false })
        .limit(500);
      
      if (error) {
        console.error("Database query failed:", error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} videos directly from database`);
      const formatted = formatVideoData(data || []);
      setLastSuccessfulFetch(new Date());
      setFetchAttempts(0);
      return formatted;
      
    } catch (err: any) {
      console.error("Error in force refetch:", err);
      
      // Only show toast for actual errors, not just empty results
      if (err.message && err.message !== "No videos found") {
        toast.error("Failed to refresh content", {
          description: err.code === "42P17" ? "Database permission issue. Please try again later." : err.message,
          duration: 5000
        });
      }
      
      setFetchAttempts(prev => prev + 1);
      
      // Return empty array to prevent further errors
      return [];
    }
  }, []);

  const fetchAllVideos = async (): Promise<VideoData[]> => {
    try {
      console.log("Fetching all videos");
      
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description")
        .is("deleted_at", null)
        .eq("content_analysis_status", "approved")
        .order("uploaded_at", { ascending: false })
        .limit(500);

      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No videos found in database");
        throw new Error("No videos found");
      }

      console.log(`Successfully fetched ${data.length} videos from database`);
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
    setFetchAttempts,
    setLastSuccessfulFetch
  };
};
