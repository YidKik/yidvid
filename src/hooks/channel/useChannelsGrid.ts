
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHiddenChannels } from "./useHiddenChannels";

export interface Channel {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  default_category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom" | null;
  fetch_error?: string | null;
  last_fetch?: string | null;
}

// Stable fetch function outside the hook
const fetchChannelsFromDB = async (): Promise<Channel[]> => {
  const { data, error } = await supabase
    .from("youtube_channels")
    .select("id, channel_id, title, thumbnail_url, description, created_at, updated_at, deleted_at, default_category, fetch_error, last_fetch")
    .is("deleted_at", null)
    .order("title", { ascending: true });
    
  if (error) {
    console.error("Error fetching channels:", error);
    throw error;
  }
  
  return data || [];
};

export const useChannelsGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { filterChannels } = useHiddenChannels();

  // Use react-query for proper caching - same pattern as useVideos
  const query = useQuery({
    queryKey: ["channels-grid"],
    queryFn: fetchChannelsFromDB,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });

  const allChannels = query.data || [];

  // Client-side search filtering
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return allChannels;
    const q = searchQuery.toLowerCase().trim();
    return allChannels.filter(channel => 
      channel.title.toLowerCase().includes(q)
    );
  }, [allChannels, searchQuery]);

  // Channels filtered for public display (excluding hidden ones)
  const visibleChannels = useMemo(() => {
    return filterChannels(filteredChannels);
  }, [filteredChannels, filterChannels]);

  return {
    fetchChannelsDirectly: fetchChannelsFromDB,
    manuallyFetchedChannels: visibleChannels,
    allChannels,
    isLoading: query.isLoading,
    setIsLoading: (_v?: boolean) => {}, // no-op for backward compat
    fetchError: query.error instanceof Error ? query.error : null,
    searchQuery,
    setSearchQuery
  };
};
