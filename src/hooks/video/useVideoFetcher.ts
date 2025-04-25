
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
      
      // Use a direct query approach to avoid RLS recursion
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*, youtube_channels(thumbnail_url)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(150);
      
      if (error) {
        console.error("Error force refetching videos:", error);
        
        // Fallback to standard query if first attempt fails
        const fallbackResult = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
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
      
      // Try the edge function approach to bypass RLS issues
      try {
        const response = await fetch("https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            const formatted = formatVideoData(result.data);
            setLastSuccessfulFetch(new Date());
            setFetchAttempts(0);
            return formatted;
          }
        }
      } catch (edgeError) {
        console.log("Edge function approach failed, using standard query", edgeError);
      }
      
      // Fallback to standard query
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
