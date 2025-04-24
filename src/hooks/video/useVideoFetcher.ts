
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
        .rpc('get_public_videos', {
          _limit: 150 // Limit to prevent large dataset issues
        })
        .select("*, youtube_channels(thumbnail_url)");
      
      if (error) {
        console.error("Error force refetching videos:", error);
        
        // Fallback to standard query if RPC fails
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
      
      // First try using the RPC approach to avoid RLS recursion
      try {
        const { data, error } = await supabase
          .rpc('get_public_videos', {
            _limit: 150
          })
          .select("*, youtube_channels(thumbnail_url)");
          
        if (!error) {
          const formatted = formatVideoData(data);
          setLastSuccessfulFetch(new Date());
          setFetchAttempts(0);
          return formatted;
        }
        
        // If RPC approach fails, log and fallback to standard approach
        console.log("RPC approach failed, falling back to standard query");
      } catch (rpcError) {
        console.log("RPC function not available, using standard query", rpcError);
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
