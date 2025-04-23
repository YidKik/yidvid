
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// Extended interface that matches the actual structure from the database
interface ExtendedYoutubeVideo {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel_id: string;
  channel_name: string;
  views: number | null;
  uploaded_at: string;
  category?: string | null;
  deleted_at?: string | null;
  description?: string | null;
  last_viewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  youtube_channels?: {
    thumbnail_url: string | null;
  };
}

export const useVideoQuery = (id: string) => {
  const { isAuthenticated, session } = useAuth();
  const [attemptedPublicFetch, setAttemptedPublicFetch] = useState(false);
  
  // Track authentication status changes to help with debugging
  useEffect(() => {
    console.log("Auth status in VideoQuery:", isAuthenticated ? "logged in" : "logged out", "for video ID:", id);
    
    if (!isAuthenticated && !attemptedPublicFetch) {
      setAttemptedPublicFetch(true);
    }
  }, [isAuthenticated, attemptedPublicFetch, id]);
  
  return useQuery({
    queryKey: ["video", id, isAuthenticated ? session?.user?.id : "anonymous"],
    queryFn: async () => {
      if (!id) throw new Error("No video ID provided");

      console.log("Attempting to fetch video with ID:", id, "Auth status:", isAuthenticated ? "logged in" : "logged out");

      try {
        // First try direct query with video_id (YouTube video ID)
        const { data: videoByVideoId, error: videoError } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .eq("video_id", id)
          .maybeSingle();

        if (!videoError && videoByVideoId) {
          console.log("Found video by video_id:", videoByVideoId);
          return videoByVideoId as ExtendedYoutubeVideo;
        } else {
          console.log("Video not found by video_id, error:", videoError);
        }

        // If not found, check if it's a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(id)) {
          // Try fetching by UUID
          const { data: videoByUuid, error: videoByUuidError } = await supabase
            .from("youtube_videos")
            .select("*, youtube_channels(thumbnail_url)")
            .eq("id", id)
            .maybeSingle();

          if (!videoByUuidError && videoByUuid) {
            console.log("Found video by UUID:", videoByUuid);
            return videoByUuid as ExtendedYoutubeVideo;
          } else {
            console.log("Video not found by UUID, error:", videoByUuidError);
          }
        }

        // If authenticated queries fail or user is logged out, try public endpoint
        try {
          console.log("Attempting public fetch for video ID:", id);
          
          // For authenticated users, we'll use anonymous key
          const authHeader = isAuthenticated 
            ? { 'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg` }
            : { 'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg` };
          
          const response = await fetch(
            `https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos?video_id=${encodeURIComponent(id)}`,
            {
              headers: {
                'Content-Type': 'application/json',
                ...authHeader
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.video) {
              console.log("Found video through public edge function:", data.video);
              return data.video as ExtendedYoutubeVideo;
            } else {
              console.log("Edge function returned no video data");
            }
          } else {
            console.warn("Public edge function response not OK:", response.status, response.statusText);
          }
        } catch (edgeError) {
          console.error("Edge function error:", edgeError);
        }
        
        // Try flexible search as fallback
        console.log("Attempting flexible search for video ID:", id);
        
        // First try a more targeted search
        const { data: partialSearchResults, error: partialSearchError } = await supabase
          .from("youtube_videos")
          .select("*, youtube_channels(thumbnail_url)")
          .ilike("video_id", `%${id.slice(0, 8)}%`) // Using just part of the ID for more flexible matching
          .limit(1);
          
        if (!partialSearchError && partialSearchResults && partialSearchResults.length > 0) {
          console.log("Found video through partial ID search:", partialSearchResults[0]);
          return partialSearchResults[0] as ExtendedYoutubeVideo;
        } else {
          console.log("Video not found through partial search, error:", partialSearchError);
        }
        
        // If still not found, try by title if the ID looks like it might contain words
        if (id.length > 5 && /[a-zA-Z]{3,}/.test(id)) {
          const { data: titleSearchResults, error: titleSearchError } = await supabase
            .from("youtube_videos")
            .select("*, youtube_channels(thumbnail_url)")
            .ilike("title", `%${id.replace(/[^a-zA-Z0-9]/g, '%')}%`) 
            .limit(1);
            
          if (!titleSearchError && titleSearchResults && titleSearchResults.length > 0) {
            console.log("Found video through title search:", titleSearchResults[0]);
            return titleSearchResults[0] as ExtendedYoutubeVideo;
          } else {
            console.log("Video not found through title search, error:", titleSearchError);
          }
        }

        console.error("Video not found with ID:", id);
        throw new Error("Video not found");
      } catch (error) {
        console.error("Error in video query:", error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000, // 1 minute
    meta: {
      suppressToasts: true
    }
  });
};
