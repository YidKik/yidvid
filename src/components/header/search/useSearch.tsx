
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

export interface SearchVideo {
  id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
}

export interface SearchChannel {
  channel_id: string;
  title: string;
  thumbnail_url: string | null;
}

export interface SearchResults {
  videos: SearchVideo[];
  channels: SearchChannel[];
}

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const navigate = useNavigate();

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      setShowResults(true);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults(null);
    setShowResults(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (searchQuery.length > 0) {
      setShowResults(true);
    }
  }, [searchQuery]);

  const handleResultClick = useCallback(() => {
    setShowResults(false);
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setShowResults(false);
      }
    },
    [searchQuery, navigate]
  );

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);

      try {
        // Search for videos
        const { data: videos, error: videosError } = await supabase
          .from("youtube_videos")
          .select("id, title, thumbnail, channel_name, video_id")
          .filter('deleted_at', 'is', null)
          .or(`title.ilike.%${debouncedSearch}%,channel_name.ilike.%${debouncedSearch}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (videosError) {
          console.error("Error searching videos:", videosError);
        }

        // Search for channels
        const { data: channels, error: channelsError } = await supabase
          .from("youtube_channels")
          .select("channel_id, title, thumbnail_url")
          .or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`)
          .limit(3);

        if (channelsError) {
          console.error("Error searching channels:", channelsError);
        }

        setSearchResults({
          videos: videos ? videos.map(v => ({
            id: v.video_id,
            title: v.title,
            thumbnail: v.thumbnail,
            channel_name: v.channel_name
          })) : [],
          channels: channels || []
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isSearchContainer = target.closest(".search-results-dropdown") !== null;
      const isSearchInput = target.closest("input[type='search']") !== null;
      
      if (!isSearchContainer && !isSearchInput) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return {
    searchQuery,
    searchResults,
    showResults,
    isSearching,
    setSearchQuery,
    setShowResults,
    handleSearchChange,
    handleSearchFocus,
    handleResultClick,
    handleSearch,
    clearSearch
  };
};
