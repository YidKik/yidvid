import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "./types/video-fetcher";
import { formatVideoData } from "./utils/database";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { useMemo } from "react";

export const useCategoryVideos = (categoryId: string) => {
  const { filterVideos } = useHiddenChannels();
  const isDefaultCategory = ["music", "torah", "inspiration", "podcast", "education", "entertainment", "other"].includes(categoryId);

  const query = useQuery({
    queryKey: ["category-videos", categoryId],
    queryFn: async (): Promise<VideoData[]> => {
      if (isDefaultCategory) {
        // Default category: query directly by category column
        const { data, error } = await supabase
          .from("youtube_videos")
          .select(`
            id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description,
            youtube_channels(thumbnail_url)
          `)
          .is("deleted_at", null)
          .eq("content_analysis_status", "approved")
          .eq("category", categoryId as any)
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        return formatVideoData(data || []);
      } else {
        // Custom category: look up via video_custom_category_mappings
        const { data: mappings, error: mapError } = await supabase
          .from("video_custom_category_mappings")
          .select("video_id")
          .eq("category_id", categoryId);

        if (mapError) throw mapError;
        if (!mappings || mappings.length === 0) return [];

        const videoIds = mappings.map(m => m.video_id).filter(Boolean) as string[];
        
        const { data, error } = await supabase
          .from("youtube_videos")
          .select(`
            id, video_id, title, thumbnail, channel_name, channel_id, views, uploaded_at, updated_at, category, description,
            youtube_channels(thumbnail_url)
          `)
          .is("deleted_at", null)
          .eq("content_analysis_status", "approved")
          .in("id", videoIds)
          .order("uploaded_at", { ascending: false });

        if (error) throw error;
        return formatVideoData(data || []);
      }
    },
    enabled: !!categoryId && categoryId !== "all",
    staleTime: 3 * 60 * 1000,
  });

  const filteredVideos = useMemo(() => {
    if (!query.data) return [];
    return filterVideos(query.data);
  }, [query.data, filterVideos]);

  return {
    videos: filteredVideos,
    isLoading: query.isLoading,
    totalCount: filteredVideos.length,
  };
};
