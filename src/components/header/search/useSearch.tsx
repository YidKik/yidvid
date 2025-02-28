
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export const useSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 200);

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ["quick-search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return { videos: [], channels: [] };
      
      try {
        // Fetch videos
        const { data: videos, error: videosError } = await supabase
          .from("youtube_videos")
          .select("id, title, thumbnail, channel_name")
          .or(`title.ilike.%${debouncedSearch}%, channel_name.ilike.%${debouncedSearch}%`)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5);

        if (videosError) throw videosError;

        // Fetch channels
        const { data: channels, error: channelsError } = await supabase
          .from("youtube_channels")
          .select("channel_id, title, thumbnail_url")
          .or(`title.ilike.%${debouncedSearch}%, description.ilike.%${debouncedSearch}%`)
          .order('created_at', { ascending: false })
          .limit(3);

        if (channelsError) throw channelsError;

        return {
          videos: videos || [],
          channels: channels || []
        };
      } catch (error: any) {
        console.error("Search error:", error);
        if (!error.message?.includes('Failed to fetch')) {
          toast.error("Search is temporarily unavailable");
        }
        return { videos: [], channels: [] };
      }
    },
    enabled: debouncedSearch.length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
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
    setShowResults(true);
  };

  const handleSearchFocus = () => {
    setShowResults(true);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery("");
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
    setShowResults
  };
};
