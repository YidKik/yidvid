
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

      console.log('🔍 Starting search for:', debouncedQuery);

      try {
        // First, let's check if we can connect to the database at all
        const { data: testConnection } = await supabase
          .from('youtube_videos')
          .select('count(*)')
          .limit(1);
        
        console.log('📊 Database connection test:', testConnection);

        // Search videos - try multiple approaches
        console.log('🎥 Searching videos...');
        
        // Try basic search first
        const { data: videos, error: videosError, count: videosCount } = await supabase
          .from('youtube_videos')
          .select('id, video_id, title, thumbnail, channel_id, channel_name', { count: 'exact' })
          .or(`title.ilike.%${debouncedQuery}%,channel_name.ilike.%${debouncedQuery}%`)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(10);

        console.log('🎥 Videos search result:', { 
          videosFound: videos?.length || 0, 
          totalCount: videosCount,
          error: videosError,
          sampleVideo: videos?.[0]
        });

        if (videosError) {
          console.error('❌ Videos search error:', videosError);
          
          // Try fallback search without OR condition
          console.log('🔄 Trying fallback video search...');
          const { data: fallbackVideos, error: fallbackError } = await supabase
            .from('youtube_videos')
            .select('id, video_id, title, thumbnail, channel_id, channel_name')
            .ilike('title', `%${debouncedQuery}%`)
            .is('deleted_at', null)
            .limit(5);
            
          console.log('🔄 Fallback videos result:', { 
            found: fallbackVideos?.length || 0, 
            error: fallbackError 
          });
        }

        // Search channels
        console.log('📺 Searching channels...');
        const { data: channels, error: channelsError, count: channelsCount } = await supabase
          .from('youtube_channels')
          .select('id, title, thumbnail_url, channel_id', { count: 'exact' })
          .ilike('title', `%${debouncedQuery}%`)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5);

        console.log('📺 Channels search result:', { 
          channelsFound: channels?.length || 0, 
          totalCount: channelsCount,
          error: channelsError,
          sampleChannel: channels?.[0]
        });

        if (channelsError) {
          console.error('❌ Channels search error:', channelsError);
        }

        // Try to get some sample data to debug
        if ((!videos || videos.length === 0) && (!channels || channels.length === 0)) {
          console.log('🔍 No results found, getting sample data for debugging...');
          
          const { data: sampleVideos } = await supabase
            .from('youtube_videos')
            .select('id, video_id, title, thumbnail, channel_id, channel_name')
            .is('deleted_at', null)
            .limit(3);
            
          const { data: sampleChannels } = await supabase
            .from('youtube_channels')
            .select('id, title, thumbnail_url, channel_id')
            .is('deleted_at', null)
            .limit(3);
            
          console.log('📊 Sample data:', { 
            sampleVideos: sampleVideos?.slice(0, 2),
            sampleChannels: sampleChannels?.slice(0, 2),
            searchQuery: debouncedQuery
          });
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
