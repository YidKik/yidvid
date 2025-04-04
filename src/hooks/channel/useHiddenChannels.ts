
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHiddenChannels = () => {
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());

  const { data: hiddenChannelsData } = useQuery({
    queryKey: ["hidden-channels"],
    queryFn: async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('hidden_channels')
            .select('channel_id')
            .eq('user_id', session.user.id);

          if (error) {
            console.error('Error loading hidden channels:', error);
            return [];
          }
          
          setHiddenChannels(new Set(data.map(hc => hc.channel_id)));
          return data;
        }
        return [];
      } catch (error) {
        console.error('Error loading hidden channels:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const hideChannel = async (channelId: string) => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      if (!session?.user?.id) {
        toast.error("You need to be logged in to hide channels");
        return;
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
        return;
      }
      
      // Update local state
      setHiddenChannels(prev => {
        const newSet = new Set(prev);
        newSet.add(channelId);
        return newSet;
      });
      
      toast.success('Channel hidden successfully');
    } catch (error) {
      console.error('Error hiding channel:', error);
      toast.error('Failed to hide channel');
    }
  };

  return {
    hiddenChannels,
    hiddenChannelsData,
    hideChannel
  };
};
