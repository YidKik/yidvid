
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVideoSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results for both videos and channels
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['video-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { videos: [], channels: [] };

      console.log('Searching for:', debouncedQuery);

      // Search videos
      const { data: videos, error: videosError } = await supabase
        .from('youtube_videos')
        .select(`
          id,
          title,
          thumbnail,
          channel_id,
          channel_name
        `)
        .or(`title.ilike.%${debouncedQuery}%,channel_name.ilike.%${debouncedQuery}%`)
        .is('deleted_at', null)
        .limit(4);

      // Search channels
      const { data: channels, error: channelsError } = await supabase
        .from('youtube_channels')
        .select(`
          id,
          title,
          thumbnail_url,
          channel_id
        `)
        .ilike('title', `%${debouncedQuery}%`)
        .is('deleted_at', null)
        .limit(3);

      if (videosError) {
        console.error('Videos search error:', videosError);
      }

      if (channelsError) {
        console.error('Channels search error:', channelsError);
      }

      const result = {
        videos: videos || [],
        channels: channels || []
      };

      console.log('Search results:', result);
      return result;
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const hasResults = searchResults && (searchResults.videos.length > 0 || searchResults.channels.length > 0);

  return {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    searchResults: searchResults || { videos: [], channels: [] },
    isLoading,
    hasResults,
    debouncedQuery
  };
};
