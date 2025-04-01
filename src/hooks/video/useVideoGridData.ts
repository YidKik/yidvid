
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
}

export const useVideoGridData = (maxVideos: number = 12) => {
  const [videos, setVideos] = useState<VideoGridItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is("deleted_at", null)
          .order("uploaded_at", { ascending: false })  // Explicitly sort by newest first
          .limit(maxVideos);
        
        if (error) {
          throw new Error(`Error fetching videos: ${error.message}`);
        }
        
        // Map the Supabase data to match our VideoGridItem interface
        // Ensure we handle the views field properly
        const mappedVideos = data.map(video => ({
          id: video.id,
          video_id: video.video_id,
          title: video.title || "Untitled Video",
          thumbnail: video.thumbnail || '/placeholder.svg',
          channelName: video.channel_name || "Unknown Channel",
          channelId: video.channel_id || "unknown-channel",
          views: video.views !== null ? parseInt(String(video.views)) : null,
          uploadedAt: video.uploaded_at || new Date().toISOString(),
        }));
        
        setVideos(mappedVideos);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [maxVideos]);

  return { videos, loading, error };
};
