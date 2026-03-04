
import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHiddenChannels = () => {
  const queryClient = useQueryClient();

  // Fetch hidden channels with stable caching - no excessive refetching
  const { data: hiddenChannelsData, isLoading, refetch } = useQuery({
    queryKey: ["hidden-channels"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      
      if (!session?.user?.id) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('hidden_channels')
        .select('channel_id')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error loading hidden channels:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - stable, prevents cascading re-renders
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Create a Set for fast lookup
  const hiddenChannelIds = useMemo(() => {
    return new Set<string>(
      hiddenChannelsData?.map(hc => hc.channel_id) || []
    );
  }, [hiddenChannelsData]);

  const isChannelHidden = useCallback((channelId: string): boolean => {
    return hiddenChannelIds.has(channelId);
  }, [hiddenChannelIds]);

  const filterVideos = useCallback(<T extends { channel_id: string }>(videos: T[]): T[] => {
    if (!videos || videos.length === 0) return [];
    if (hiddenChannelIds.size === 0) return videos;
    return videos.filter(video => !hiddenChannelIds.has(video.channel_id));
  }, [hiddenChannelIds]);

  const filterChannels = useCallback(<T extends { channel_id: string }>(channels: T[]): T[] => {
    if (!channels || channels.length === 0) return [];
    if (hiddenChannelIds.size === 0) return channels;
    return channels.filter(channel => !hiddenChannelIds.has(channel.channel_id));
  }, [hiddenChannelIds]);

  const invalidateAllQueries = useCallback(async () => {
    await refetch();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["videos"] }),
      queryClient.invalidateQueries({ queryKey: ["video-search"] }),
      queryClient.invalidateQueries({ queryKey: ["category-videos"] }),
      queryClient.invalidateQueries({ queryKey: ["youtube_videos"] }),
      queryClient.invalidateQueries({ queryKey: ["youtube_channels"] }),
      queryClient.invalidateQueries({ queryKey: ["channels-grid"] }),
      queryClient.invalidateQueries({ queryKey: ["channel-videos"] }),
    ]);
  }, [queryClient, refetch]);

  const hideChannel = async (channelId: string) => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      if (!session?.user?.id) {
        toast.error("You need to be logged in to hide channels");
        return false;
      }
      
      const { error } = await supabase
        .from('hidden_channels')
        .insert({
          user_id: session.user.id,
          channel_id: channelId
        });
        
      if (error) {
        console.error('Error hiding channel:', error);
        toast.error('Failed to hide channel');
        return false;
      }
      
      await invalidateAllQueries();
      toast.success('Channel hidden successfully');
      return true;
    } catch (error) {
      console.error('Error hiding channel:', error);
      toast.error('Failed to hide channel');
      return false;
    }
  };

  const unhideChannel = async (channelId: string) => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      if (!session?.user?.id) {
        toast.error("You need to be logged in to manage channels");
        return false;
      }
      
      const { error } = await supabase
        .from('hidden_channels')
        .delete()
        .eq('user_id', session.user.id)
        .eq('channel_id', channelId);
        
      if (error) {
        console.error('Error unhiding channel:', error);
        toast.error('Failed to show channel');
        return false;
      }
      
      await invalidateAllQueries();
      toast.success('Channel is now visible');
      return true;
    } catch (error) {
      console.error('Error unhiding channel:', error);
      toast.error('Failed to show channel');
      return false;
    }
  };

  return {
    hiddenChannelIds,
    hiddenChannelsData,
    isLoading,
    isChannelHidden,
    filterVideos,
    filterChannels,
    hideChannel,
    unhideChannel,
    refetch,
    invalidateAllQueries
  };
};
