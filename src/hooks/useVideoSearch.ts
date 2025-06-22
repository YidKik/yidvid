
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

  // Fetch search results for both videos and channels - removed auth dependencies
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['video-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { videos: [], channels: [] };

      console.log('🔍 Starting search for:', debouncedQuery);

      try {
        // Search videos - using public access without auth checks
        console.log('🎥 Searching videos...');
        
        const { data: videos, error: videosError } = await supabase
          .from('youtube_videos')
          .select('id, video_id, title, thumbnail, channel_id, channel_name')
          .or(`title.ilike.%${debouncedQuery}%,channel_name.ilike.%${debouncedQuery}%`)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(10);

        console.log('🎥 Videos search result:', { 
          videosFound: videos?.length || 0, 
          error: videosError,
          sampleVideo: videos?.[0]
        });

        // Search channels - using public access without auth checks
        console.log('📺 Searching channels...');
        const { data: channels, error: channelsError } = await supabase
          .from('youtube_channels')
          .select('id, title, thumbnail_url, channel_id')
          .ilike('title', `%${debouncedQuery}%`)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5);

        console.log('📺 Channels search result:', { 
          channelsFound: channels?.length || 0, 
          error: channelsError,
          sampleChannel: channels?.[0]
        });

        // Handle any errors gracefully without blocking the search
        if (videosError) {
          console.warn('Videos search error (continuing):', videosError);
        }
        
        if (channelsError) {
          console.warn('Channels search error (continuing):', channelsError);
        }

        const result = {
          videos: videos || [],
          channels: channels || []
        };

        console.log('✅ Final search results:', {
          videosCount: result.videos.length,
          channelsCount: result.channels.length,
          query: debouncedQuery
        });
        
        return result;
      } catch (error) {
        console.error('💥 Search error:', error);
        // Return empty results instead of failing
        return { videos: [], channels: [] };
      }
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30000, // Cache results for 30 seconds
    retry: 1,
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  const hasResults = useMemo(() => {
    const result = searchResults && (
      (searchResults.videos && searchResults.videos.length > 0) || 
      (searchResults.channels && searchResults.channels.length > 0)
    );
    console.log('🎯 hasResults:', result, searchResults);
    return result;
  }, [searchResults]);

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
