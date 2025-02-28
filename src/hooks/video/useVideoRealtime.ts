
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to set up real-time subscriptions for video-related changes
 */
export const useVideoRealtime = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for videos and category mappings
  useEffect(() => {
    const channel = supabase
      .channel('youtube_videos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_videos'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
        }
      )
      .subscribe();

    // Also subscribe to category mapping changes
    const categoryMappingChannel = supabase
      .channel('category_mapping_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_custom_category_mappings'
        },
        (payload) => {
          console.log('Category mapping changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
          queryClient.invalidateQueries({ queryKey: ["category-videos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(categoryMappingChannel);
    };
  }, [queryClient]);
};
