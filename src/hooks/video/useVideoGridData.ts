
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VideoGridItem {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  channel_id: string;
  views: number | null;
  uploaded_at: string | Date;
  updated_at?: string | Date;
  channelThumbnail?: string;
}

export const useVideoGridData = (maxVideos: number = 12, shouldFetch: boolean = true) => {
  const [videos, setVideos] = useState<VideoGridItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        // Skip fetching if we shouldn't fetch
        if (!shouldFetch) {
          setLoading(false);
          return;
        }

        console.log(`Fetching up to ${maxVideos} videos from Supabase or edge function`);
        
        // First try the edge function for public access
        try {
          const response = await fetch(
            "https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-videos",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
              }
            }
          );
          
          if (response.ok) {
            const result = await response.json();
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
              console.log(`Retrieved ${result.data.length} videos with edge function`);
              
              // Map the edge function data to match our VideoGridItem interface
              const mappedVideos = result.data.map(video => ({
                id: video.id,
                video_id: video.video_id,
                title: video.title || "Untitled Video",
                thumbnail: video.thumbnail || '/placeholder.svg',
                channel_name: video.channel_name || "Unknown Channel",
                channel_id: video.channel_id || "unknown-channel",
                views: video.views !== null ? parseInt(String(video.views)) : null,
                uploaded_at: video.uploaded_at || new Date().toISOString(),
                updated_at: video.updated_at || video.uploaded_at,
              }));
              
              // Ensure videos are sorted by uploaded_at in descending order
              const sortedVideos = mappedVideos.sort((a, b) => {
                const dateA = new Date(a.uploaded_at).getTime();
                const dateB = new Date(b.uploaded_at).getTime();
                return dateB - dateA; // Newest first
              });
              
              setVideos(sortedVideos);
              setLoading(false);
              return;
            }
          }
        } catch (edgeError) {
          console.error("Edge function error:", edgeError);
        }
        
        // Fall back to direct database query
        const { data, error } = await supabase
          .from("youtube_videos")
          .select(`
            *,
            youtube_channels:channel_id (
              thumbnail_url
            )
          `)
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })
          .limit(maxVideos);
        
        if (error) {
          console.error("Supabase error:", error);
          
          // Try a simpler query as fallback
          const { data: simpleData, error: simpleError } = await supabase
            .from("youtube_videos")
            .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at")
            .is("deleted_at", null)
            .order("uploaded_at", { ascending: false })
            .limit(maxVideos);
            
          if (simpleError) {
            throw new Error(`Error fetching videos: ${simpleError.message}`);
          }
          
          if (simpleData && simpleData.length > 0) {
            // Map the Supabase data to match our VideoGridItem interface
            const mappedVideos = simpleData.map(video => ({
              id: video.id,
              video_id: video.video_id,
              title: video.title || "Untitled Video",
              thumbnail: video.thumbnail || '/placeholder.svg',
              channel_name: video.channel_name || "Unknown Channel",
              channel_id: video.channel_id || "unknown-channel",
              views: video.views !== null ? parseInt(String(video.views)) : null,
              uploaded_at: video.uploaded_at || new Date().toISOString(),
              updated_at: video.updated_at || video.uploaded_at,
              channelThumbnail: null,
            }));
            
            setVideos(mappedVideos);
            setLoading(false);
            return;
          }
          
          throw new Error(`Error fetching videos: ${error.message}`);
        }
        
        console.log(`Successfully fetched ${data?.length || 0} videos`);
        
        // Map the Supabase data to match our VideoGridItem interface
        const mappedVideos = data.map(video => ({
          id: video.id,
          video_id: video.video_id,
          title: video.title || "Untitled Video",
          thumbnail: video.thumbnail || '/placeholder.svg',
          channel_name: video.channel_name || "Unknown Channel",
          channel_id: video.channel_id || "unknown-channel",
          views: video.views !== null ? parseInt(String(video.views)) : null,
          uploaded_at: video.uploaded_at || new Date().toISOString(),
          updated_at: video.updated_at || video.uploaded_at,
          channelThumbnail: video.youtube_channels?.thumbnail_url || null,
        }));
        
        // Ensure videos are sorted by uploaded_at in descending order
        const sortedVideos = mappedVideos.sort((a, b) => {
          const dateA = new Date(a.uploaded_at).getTime();
          const dateB = new Date(b.uploaded_at).getTime();
          return dateB - dateA; // Newest first
        });
        
        setVideos(sortedVideos);
      } catch (err) {
        console.error("Error in useVideoGridData:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [maxVideos, shouldFetch]);

  return { videos, loading, error };
};
