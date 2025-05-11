
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300); // Increased debounce time for better performance
  
  // Check cache before making a new request
  const getSearchFromCache = (query: string): SearchResults | undefined => {
    return queryClient.getQueryData<SearchResults>(["quick-search", query]);
  };

  // Use edge function for searches when possible to improve reliability
  const fetchSearchResults = async (query: string): Promise<SearchResults> => {
    if (!query.trim() || query.trim().length < 2) {
      return { videos: [], channels: [] };
    }
    
    try {
      // First try the edge function which works better for public access
      try {
        console.log("Trying edge function for search...");
        const response = await fetch(`https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/quick-search?q=${encodeURIComponent(query)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            console.log("Retrieved search results from edge function");
            return {
              videos: result.data.videos || [],
              channels: result.data.channels || []
            };
          }
        }
      } catch (edgeFnError) {
        console.error("Edge function search error:", edgeFnError);
        // Continue to try direct database query
      }

      // Fallback to direct database query with optimized performance
      const videosPromise = supabase
        .from("youtube_videos")
        .select("id, title, thumbnail, channel_name")
        .filter('deleted_at', 'is', null)
        .or(`title.ilike.%${query}%,channel_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(5);
        
      const channelsPromise = supabase
        .from("youtube_channels")
        .select("channel_id, title, thumbnail_url")
        .filter('deleted_at', 'is', null)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(3);
        
      // Run both queries in parallel for better performance
      const [videosResult, channelsResult] = await Promise.all([videosPromise, channelsPromise]);
      
      return {
        videos: videosResult.data || [],
        channels: channelsResult.data || []
      };
    } catch (error) {
      console.error("Search error:", error);
      return { videos: [], channels: [] };
    }
  };

  const { data: searchResults, isFetching: isSearching } = useQuery<SearchResults>({
    queryKey: ["quick-search", debouncedSearch],
    queryFn: () => fetchSearchResults(debouncedSearch),
    enabled: debouncedSearch.length > 1, // Search with minimum 2 characters for better performance
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 15,   // 15 minutes garbage collection
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
    searchResults: searchResults || { videos: [], channels: [] },
    isSearching,
    handleSearch,
    handleSearchChange,
    handleSearchFocus,
    handleResultClick,
    handleKeyDown,
    setShowResults
  };
};
