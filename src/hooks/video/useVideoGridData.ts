
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";

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
  const [rawVideos, setRawVideos] = useState<VideoGridItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { filterVideos, hiddenChannelIds } = useHiddenChannels();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        if (!shouldFetch) {
          setLoading(false);
          return;
        }

        // Fetch more videos to account for filtering
        const fetchLimit = maxVideos + (hiddenChannelIds.size * 2);
        
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
          .limit(fetchLimit);
        
        if (error) {
          // Try a simpler query as fallback
          const { data: simpleData, error: simpleError } = await supabase
            .from("youtube_videos")
            .select("id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at")
            .is("deleted_at", null)
            .order("uploaded_at", { ascending: false })
            .limit(fetchLimit);
            
          if (simpleError) {
            throw new Error(`Error fetching videos: ${simpleError.message}`);
          }
          
          if (simpleData && simpleData.length > 0) {
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
            
            setRawVideos(mappedVideos);
            setLoading(false);
            return;
          }
          
          throw new Error(`Error fetching videos: ${error.message}`);
        }
        
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
          return dateB - dateA;
        });
        
        setRawVideos(sortedVideos);
      } catch (err) {
        console.error("Error in useVideoGridData:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setRawVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [maxVideos, shouldFetch, hiddenChannelIds.size]);

  // Filter out hidden channels and limit to maxVideos
  const videos = useMemo(() => {
    const filtered = filterVideos(rawVideos);
    return filtered.slice(0, maxVideos);
  }, [rawVideos, filterVideos, maxVideos]);

  return { videos, loading, error };
};
