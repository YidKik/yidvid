
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHiddenChannels = () => {
  const queryClient = useQueryClient();

  // Fetch hidden channels from database
  const { data: hiddenChannelsData, isLoading, refetch } = useQuery({
    queryKey: ["hidden-channels"],
    queryFn: async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        
        if (!session?.user?.id) {
          console.log("No user session for hidden channels");
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
        
        console.log(`Loaded ${data?.length || 0} hidden channels for user`);
        return data || [];
      } catch (error) {
        console.error('Error loading hidden channels:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Create a Set for fast lookup
  const hiddenChannelIds = new Set(
    hiddenChannelsData?.map(hc => hc.channel_id) || []
  );

  // Check if a channel is hidden
  const isChannelHidden = useCallback((channelId: string): boolean => {
    return hiddenChannelIds.has(channelId);
  }, [hiddenChannelIds]);

  // Filter videos by removing those from hidden channels
  const filterVideos = useCallback(<T extends { channel_id: string }>(videos: T[]): T[] => {
    if (hiddenChannelIds.size === 0) return videos;
    return videos.filter(video => !hiddenChannelIds.has(video.channel_id));
  }, [hiddenChannelIds]);

  // Filter channels by removing hidden ones
  const filterChannels = useCallback(<T extends { channel_id: string }>(channels: T[]): T[] => {
    if (hiddenChannelIds.size === 0) return channels;
    return channels.filter(channel => !hiddenChannelIds.has(channel.channel_id));
  }, [hiddenChannelIds]);

  // Hide a channel
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
      
      // Invalidate queries to refresh data everywhere
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video-search"] });
      
      toast.success('Channel hidden successfully');
      return true;
    } catch (error) {
      console.error('Error hiding channel:', error);
      toast.error('Failed to hide channel');
      return false;
    }
  };

  // Unhide a channel
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
      
      // Invalidate queries to refresh data everywhere
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video-search"] });
      
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
    refetch
  };
};
