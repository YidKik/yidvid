
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VideoGridItem {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number | null;
  uploadedAt: string | Date;
  channelThumbnail?: string;
}

export const useVideoGridData = (maxVideos: number = 12) => {
  const [videos, setVideos] = useState<VideoGridItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        console.log(`Fetching up to ${maxVideos} videos from Supabase`);
        
        const { data, error } = await supabase
          .from("youtube_videos")
          .select(`
            *,
            youtube_channels:channel_id (
              thumbnail_url
            )
          `)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })  // Changed from uploaded_at to created_at
          .limit(maxVideos);
        
        if (error) {
          console.error("Supabase error:", error);
          throw new Error(`Error fetching videos: ${error.message}`);
        }
        
        console.log(`Successfully fetched ${data?.length || 0} videos`);
        
        // Map the Supabase data to match our VideoGridItem interface
        // Ensure we handle the views field and channel_thumbnail properly
        const mappedVideos = data.map(video => ({
          id: video.id,
          video_id: video.video_id,
          title: video.title || "Untitled Video",
          thumbnail: video.thumbnail || '/placeholder.svg',
          channelName: video.channel_name || "Unknown Channel",
          channelId: video.channel_id || "unknown-channel",
          views: video.views !== null ? parseInt(String(video.views)) : null,
          uploadedAt: video.uploaded_at || new Date().toISOString(),
          channelThumbnail: video.youtube_channels?.thumbnail_url || null, // Correctly access nested property
        }));
        
        setVideos(mappedVideos);
      } catch (err) {
        console.error("Error in useVideoGridData:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Still set videos to empty array to avoid undefined errors
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [maxVideos]);

  return { videos, loading, error };
};
