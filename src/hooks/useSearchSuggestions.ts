import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Suggestion {
  name: string;
  type: 'channel';
}

export const useSearchSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Fetch channels
        const { data: channels } = await supabase
          .from('youtube_channels')
          .select('title')
          .is('deleted_at', null)
          .limit(15);

        const allSuggestions: Suggestion[] = [];

        if (channels) {
          channels.forEach(channel => {
            allSuggestions.push({ name: channel.title, type: 'channel' });
          });
        }

        // Shuffle the suggestions for variety
        const shuffled = allSuggestions.sort(() => Math.random() - 0.5);
        
        setSuggestions(shuffled);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([
          { name: 'Jewish Music', type: 'channel' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  return { suggestions, isLoading };
};
