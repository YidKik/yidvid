
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useHiddenChannels } from '@/hooks/channel/useHiddenChannels';

export const useVideoSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Get hidden channels filter
  const { filterVideos, filterChannels, hiddenChannelIds } = useHiddenChannels();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results for both videos and channels
  const { data: rawSearchResults, isLoading } = useQuery({
    queryKey: ['video-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { videos: [], channels: [] };

      console.log('🔍 Starting search for:', debouncedQuery);

      try {
        // Search videos
        const { data: videos, error: videosError } = await supabase
          .from('youtube_videos')
          .select('id, video_id, title, thumbnail, channel_id, channel_name')
          .or(`title.ilike.%${debouncedQuery}%,channel_name.ilike.%${debouncedQuery}%`)
          .is('deleted_at', null)
          .eq('content_analysis_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(20); // Fetch more to account for filtering

        // Search channels
        const { data: channels, error: channelsError } = await supabase
          .from('youtube_channels')
          .select('id, title, thumbnail_url, channel_id')
          .ilike('title', `%${debouncedQuery}%`)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(10); // Fetch more to account for filtering

        if (videosError) {
          console.warn('Videos search error:', videosError);
        }
        
        if (channelsError) {
          console.warn('Channels search error:', channelsError);
        }

        return {
          videos: videos || [],
          channels: channels || []
        };
      } catch (error) {
        console.error('Search error:', error);
        return { videos: [], channels: [] };
      }
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30000,
    retry: 1,
    gcTime: 1000 * 60 * 5,
  });

  // Filter out hidden channels from search results
  const searchResults = useMemo(() => {
    if (!rawSearchResults) return { videos: [], channels: [] };
    
    const filteredVideos = filterVideos(rawSearchResults.videos).slice(0, 10);
    const filteredChannels = filterChannels(rawSearchResults.channels).slice(0, 5);
    
    console.log('🔍 Filtered search results:', {
      originalVideos: rawSearchResults.videos.length,
      filteredVideos: filteredVideos.length,
      originalChannels: rawSearchResults.channels.length,
      filteredChannels: filteredChannels.length,
      hiddenCount: hiddenChannelIds.size
    });
    
    return {
      videos: filteredVideos,
      channels: filteredChannels
    };
  }, [rawSearchResults, filterVideos, filterChannels, hiddenChannelIds]);

  const hasResults = useMemo(() => {
    return searchResults && (
      searchResults.videos.length > 0 || 
      searchResults.channels.length > 0
    );
  }, [searchResults]);

  return {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    searchResults,
    isLoading,
    hasResults,
    debouncedQuery
  };
};
