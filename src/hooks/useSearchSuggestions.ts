import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Suggestion {
  name: string;
  type: 'channel' | 'video';
}

export const useSearchSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Fetch most viewed videos (top 5)
        const { data: popularVideos } = await supabase
          .from('youtube_videos')
          .select('title, views')
          .is('deleted_at', null)
          .order('views', { ascending: false, nullsFirst: false })
          .limit(5);

        // Fetch recently added videos (top 5)
        const { data: recentVideos } = await supabase
          .from('youtube_videos')
          .select('title, uploaded_at')
          .is('deleted_at', null)
          .order('uploaded_at', { ascending: false })
          .limit(5);

        // Fetch channels (top 5)
        const { data: channels } = await supabase
          .from('youtube_channels')
          .select('title')
          .is('deleted_at', null)
          .limit(5);

        const allSuggestions: Suggestion[] = [];

        // Add popular videos
        if (popularVideos) {
          popularVideos.forEach(video => {
            allSuggestions.push({ name: video.title, type: 'video' });
          });
        }

        // Add recent videos (avoid duplicates)
        if (recentVideos) {
          recentVideos.forEach(video => {
            if (!allSuggestions.some(s => s.name === video.title)) {
              allSuggestions.push({ name: video.title, type: 'video' });
            }
          });
        }

        // Add channels
        if (channels) {
          channels.forEach(channel => {
            allSuggestions.push({ name: channel.title, type: 'channel' });
          });
        }

        // Shuffle the suggestions for variety
        const shuffled = allSuggestions.sort(() => Math.random() - 0.5);
        
        setSuggestions(shuffled.slice(0, 10)); // Keep top 10
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Fallback suggestions
        setSuggestions([
          { name: 'Jewish Music', type: 'channel' },
          { name: 'Torah Videos', type: 'video' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  return { suggestions, isLoading };
};
