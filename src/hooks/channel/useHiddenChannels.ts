
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  return {
    hiddenChannels,
    hiddenChannelsData
  };
};
