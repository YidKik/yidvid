
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
  updated_at?: string | Date;
  channelThumbnail?: string;
}

export const useVideoGridData = (maxVideos: number = 12, isAuthenticated: boolean = false) => {
  const [videos, setVideos] = useState<VideoGridItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        // Skip fetching if not authenticated
        if (!isAuthenticated) {
          setLoading(false);
          return;
        }

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
          .order("updated_at", { ascending: false })
          .limit(maxVideos);
        
        if (error) {
          console.error("Supabase error:", error);
          throw new Error(`Error fetching videos: ${error.message}`);
        }
        
        console.log(`Successfully fetched ${data?.length || 0} videos`);
        
        // Map the Supabase data to match our VideoGridItem interface
        const mappedVideos = data.map(video => ({
          id: video.id,
          video_id: video.video_id,
          title: video.title || "Untitled Video",
          thumbnail: video.thumbnail || '/placeholder.svg',
          channelName: video.channel_name || "Unknown Channel",
          channelId: video.channel_id || "unknown-channel",
          views: video.views !== null ? parseInt(String(video.views)) : null,
          uploadedAt: video.uploaded_at || new Date().toISOString(),
          updated_at: video.updated_at || video.uploaded_at,
          channelThumbnail: video.youtube_channels?.thumbnail_url || null,
        }));
        
        // Ensure videos are sorted by updated_at in descending order
        const sortedVideos = mappedVideos.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.uploadedAt).getTime();
          const dateB = new Date(b.updated_at || b.uploadedAt).getTime();
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
  }, [maxVideos, isAuthenticated]);

  return { videos, loading, error };
};
