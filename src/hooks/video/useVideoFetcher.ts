
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
      
      // Try direct database query first with higher limit and explicit uploaded_at sorting
      try {
        console.log("Attempting direct database query first...");
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })  // Sort by uploaded_at
          .limit(150);
        
        if (!error && data && data.length > 0) {
          console.log(`Successfully fetched ${data.length} videos directly from database, sorted by uploaded_at`);
          const formatted = formatVideoData(data);
          setLastSuccessfulFetch(new Date());
          setFetchAttempts(0);
          return formatted;
        } else {
          console.log("Direct query resulted in error or no data:", error);
        }
      } catch (directError) {
        console.error("Direct database query failed:", directError);
      }
      
      // If direct query fails, try edge function as backup
      try {
        console.log("Attempting to fetch videos via edge function...");
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
            console.log(`Successfully fetched ${result.data.length} videos from edge function`);
            const formatted = formatVideoData(result.data);
            setLastSuccessfulFetch(new Date());
            setFetchAttempts(0);
            return formatted;
          } else {
            console.log("Edge function returned no videos");
          }
        } else {
          console.log("Edge function response not OK:", response.status);
        }
      } catch (edgeError) {
        console.log("Edge function approach failed", edgeError);
      }
      
      // Use a direct query approach with more robust error handling as last resort
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false })  // Ensure sorting by uploaded_at here too
        .limit(100);
        
      if (fallbackError) {
        console.error("Fallback query failed:", fallbackError);
        throw fallbackError;
      }
      
      console.log(`Fallback query successful, retrieved ${fallbackData?.length || 0} videos, sorted by uploaded_at`);
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
      
      // Try direct database query first with higher limit and explicit uploaded_at sorting
      try {
        console.log("Attempting direct database query first for all videos...");
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })  // Ensure sorting by uploaded_at
          .limit(150);
        
        if (!error && data && data.length > 0) {
          console.log(`Successfully fetched ${data.length} videos directly from database, sorted by uploaded_at`);
          setLastSuccessfulFetch(new Date());
          setFetchAttempts(0);
          return formatVideoData(data);
        } else {
          console.log("Direct query resulted in error or no data:", error);
        }
      } catch (directError) {
        console.error("Direct database query failed:", directError);
      }
      
      // If direct query fails, try simplified query with explicit uploaded_at sorting
      const { data: simpleData, error: simpleError } = await supabase
        .from("youtube_videos")
        .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false })  // Sort by uploaded_at
        .limit(150);
        
      if (!simpleError && simpleData && simpleData.length > 0) {
        console.log(`Successfully fetched ${simpleData.length} videos with simplified query, sorted by uploaded_at`);
        const formatted = formatVideoData(simpleData);
        setLastSuccessfulFetch(new Date());
        setFetchAttempts(0);
        return formatted;
      }
      
      // Try edge function only if database queries fail
      try {
        console.log("Database queries failed, trying edge function...");
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
            console.log(`Successfully fetched ${result.data.length} videos from edge function`);
            const formatted = formatVideoData(result.data);
            setLastSuccessfulFetch(new Date());
            setFetchAttempts(0);
            return formatted;
          }
        }
      } catch (edgeError) {
        console.log("Edge function approach failed", edgeError);
      }

      // Last resort fallback query with uploaded_at sorting
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("youtube_videos")
        .select("*")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false })  // Ensure sorting by uploaded_at
        .limit(100);

      if (fallbackError) {
        console.error("Error fetching videos:", fallbackError);
        throw fallbackError;
      }

      if (!fallbackData || fallbackData.length === 0) {
        console.log("No videos found in database");
        throw new Error("No videos found");
      }

      console.log(`Successfully fetched ${fallbackData.length} videos from final fallback, sorted by uploaded_at`);
      const formatted = formatVideoData(fallbackData);
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
