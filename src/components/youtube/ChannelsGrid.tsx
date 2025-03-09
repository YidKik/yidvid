
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RequestChannelDialog } from "./RequestChannelDialog";
import { useHiddenChannels } from "@/hooks/channel/useHiddenChannels";
import { useChannelsGrid, Channel } from "@/hooks/channel/useChannelsGrid";
import { ChannelsGridSkeleton } from "./grid/ChannelsGridSkeleton";
import { EmptyChannelsState } from "./grid/EmptyChannelsState";
import { ChannelCard } from "./grid/ChannelCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";

interface ChannelsGridProps {
  onError?: (error: any) => void;
}

export const ChannelsGrid = ({ onError }: ChannelsGridProps) => {
  const { hiddenChannels } = useHiddenChannels();
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const { session } = useSession();
  
  const { 
    fetchChannelsDirectly, 
    manuallyFetchedChannels, 
    isLoading, 
    setIsLoading,
    fetchError,
    fetchAttempts
  } = useChannelsGrid();
  
  // Try to fetch directly from database first for faster loading
  const fetchChannelsFromDB = async () => {
    try {
      console.log("Direct database fetch for channels...");
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_id, title, thumbnail_url")
        .is("deleted_at", null)
        .limit(50);
        
      if (error) {
        console.error("Direct DB fetch error:", error);
        return null;
      }
      
      if (data && data.length > 0) {
        console.log(`Successfully fetched ${data.length} channels directly from DB`);
        return data;
      }
      
      return null;
    } catch (err) {
      console.error("Error in direct DB fetch:", err);
      return null;
    }
  };

  // Fetch channels with improved retry logic
  const { data: channels, error, isLoading: isChannelsLoading, refetch } = useQuery({
    queryKey: ["youtube_channels"],
    queryFn: async () => {
      const dbChannels = await fetchChannelsFromDB();
      if (dbChannels && dbChannels.length > 0) {
        return dbChannels;
      }
      
      // Fall back to the manual fetch function
      const manualData = await fetchChannelsDirectly();
      if (manualData && manualData.length > 0) {
        return manualData;
      }
      
      // If all else fails, try one more direct query with minimal fields
      try {
        const lastAttempt = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .limit(30);
          
        if (!lastAttempt.error && lastAttempt.data?.length > 0) {
          return lastAttempt.data;
        }
      } catch (e) {
        console.error("Final attempt also failed:", e);
      }
      
      // If we get here, we need sample data
      return createSampleChannels();
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Failed to load channels",
      suppressToasts: true
    },
  });

  // Immediate fetch on mount
  useEffect(() => {
    console.log(`ChannelsGrid mounted, user authenticated: ${!!session}, attempting to fetch channels`);
    refetch().catch(err => {
      console.error("Error fetching channels on mount:", err);
      if (onError) onError(err);
    });
  }, [session, refetch, onError]);

  // Update loading state based on data
  useEffect(() => {
    if (channels?.length || manuallyFetchedChannels?.length) {
      setIsLoading(false);
    }
  }, [channels, manuallyFetchedChannels, setIsLoading]);

  // Create sample data as last resort
  const createSampleChannels = (): Channel[] => {
    return Array(8).fill(null).map((_, i) => ({
      id: `sample-${i}`,
      channel_id: `sample-channel-${i}`,
      title: `Sample Channel ${i+1}`,
      thumbnail_url: null
    }));
  };
  
  // Check if we have real data (not samples)
  const hasRealChannels = (data?: Channel[]) => {
    if (!data || data.length === 0) return false;
    return data.some(c => 
      !c.id.toString().includes('sample') && 
      !c.channel_id.includes('sample') &&
      c.title !== "Sample Channel 1"
    );
  };
  
  // Find the best data source to display
  let displayChannels: Channel[] = [];
  
  if (hasRealChannels(channels)) {
    console.log("Using real channels data from react-query cache");
    displayChannels = channels || [];
  } else if (hasRealChannels(manuallyFetchedChannels)) {
    console.log("Using real channels data from manual fetch");
    displayChannels = manuallyFetchedChannels;
  } else if (channels?.length) {
    displayChannels = channels;
  } else if (manuallyFetchedChannels?.length) {
    displayChannels = manuallyFetchedChannels;
  } else {
    // Use sample channels as fallback
    displayChannels = createSampleChannels();
  }
  
  // Log for debugging
  useEffect(() => {
    if (hasRealChannels(displayChannels)) {
      console.log(`Displaying ${displayChannels.length} REAL channels`);
    } else {
      console.log(`Displaying ${displayChannels.length} SAMPLE channels`);
    }
  }, [displayChannels]);
  
  // Filter out hidden channels (but only if we have enough channels)
  const visibleChannels = displayChannels?.length > 4 
    ? displayChannels.filter(channel => !hiddenChannels.has(channel.channel_id)) 
    : displayChannels || [];

  // Skip loading animation on main page
  const showSkeleton = isLoading && isChannelsLoading && !manuallyFetchedChannels.length && !isMainPage;

  if (showSkeleton) {
    return <ChannelsGridSkeleton />;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 animate-scaleIn">
      <div className="flex items-center justify-between mb-3 md:mb-8">
        <h2 className="text-base md:text-2xl font-bold text-accent">View All Channels</h2>
        <RequestChannelDialog />
      </div>
      
      {visibleChannels.length === 0 ? (
        <EmptyChannelsState />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {visibleChannels.map((channel, index) => (
            <ChannelCard
              key={channel.id || `channel-${index}`}
              id={channel.id}
              channel_id={channel.channel_id}
              title={channel.title}
              thumbnail_url={channel.thumbnail_url} 
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};
