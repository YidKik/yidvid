
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

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['video-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];

      const { data, error } = await supabase
        .from('youtube_videos')
        .select(`
          id,
          title,
          thumbnail,
          channel_id,
          youtube_channels!inner(
            title
          )
        `)
        .or(`title.ilike.%${debouncedQuery}%,youtube_channels.title.ilike.%${debouncedQuery}%`)
        .is('deleted_at', null)
        .limit(6);

      if (error) {
        console.error('Search error:', error);
        return [];
      }

      return data || [];
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const hasResults = searchResults && searchResults.length > 0;

  return {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    searchResults: searchResults || [],
    isLoading,
    hasResults,
    debouncedQuery
  };
};
