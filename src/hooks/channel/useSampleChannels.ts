
import { useCallback } from "react";
import { Channel } from "./useChannelsGrid";

/**
 * Hook to generate and manage sample channels for fallback display
 */
export const useSampleChannels = () => {
  /**
   * Creates sample channel data for fallback display
   */
  const createSampleChannels = useCallback((): Channel[] => {
    return Array(8).fill(null).map((_, i) => ({
      id: `sample-${i}`,
      channel_id: `sample-channel-${i}`,
      title: `Sample Channel ${i+1}`,
      thumbnail_url: null
    }));
  }, []);

  /**
   * Checks if a channel array contains real (non-sample) channels
   */
  const hasRealChannels = useCallback((channels?: Channel[] | null): boolean => {
    if (!channels || channels.length === 0) return false;
    
    return channels.some(channel => 
      channel && 
      channel.id && 
      !channel.id.toString().includes('sample') && 
      channel.title !== 'Sample Channel'
    );
  }, []);

  return {
    createSampleChannels,
    hasRealChannels
  };
};
