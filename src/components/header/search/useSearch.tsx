
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { queryClient } from "@/lib/query-client";

// Define interfaces for the search results
export interface SearchVideo {
  id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
}

export interface SearchChannel {
  channel_id: string;
  title: string;
  thumbnail_url: string;
}

export interface SearchResults {
  videos: SearchVideo[];
  channels: SearchChannel[];
}

export const useSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 150); // Better balance between responsiveness and performance

  // Check cache before making a new request
  const getSearchFromCache = (query: string): SearchResults | undefined => {
    return queryClient.getQueryData<SearchResults>(["quick-search", query]);
  };

  const { data: searchResults, isFetching: isSearching } = useQuery<SearchResults>({
    queryKey: ["quick-search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return { videos: [], channels: [] };
      
      // Check if we have a cached result
      const cachedResult = getSearchFromCache(debouncedSearch);
      if (cachedResult) return cachedResult;
      
      try {
        // Optimize query performance by limiting results earlier
        const { data: videos, error: videosError } = await supabase
          .from("youtube_videos")
          .select("id, title, thumbnail, channel_name")
          .filter('deleted_at', 'is', null)
          .or(`title.ilike.%${debouncedSearch}%,channel_name.ilike.%${debouncedSearch}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (videosError) throw videosError;

        const { data: channels, error: channelsError } = await supabase
          .from("youtube_channels")
          .select("channel_id, title, thumbnail_url")
          .or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`)
          .order('created_at', { ascending: false })
          .limit(3);

        if (channelsError) throw channelsError;

        console.log("Search results:", { videos: videos?.length || 0, channels: channels?.length || 0 });
        
        const result: SearchResults = {
          videos: videos || [],
          channels: channels || []
        };
        
        return result;
      } catch (error: any) {
        console.error("Search error:", error);
        return { videos: [], channels: [] };
      }
    },
    enabled: debouncedSearch.length > 1, // Search when at least 2 characters are typed for better responsiveness
    staleTime: 1000 * 60 * 1, // Cache for 1 minute is enough for search results
    gcTime: 1000 * 60 * 5,   // Garbage collection after 5 minutes
    refetchOnWindowFocus: false,
    meta: {
      suppressToasts: true
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowResults(true);
    }
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e);
    }
  };

  return {
    searchQuery,
    showResults,
    searchResults,
    isSearching,
    handleSearch,
    handleSearchChange,
    handleSearchFocus,
    handleResultClick,
    handleKeyDown,
    setShowResults
  };
};
