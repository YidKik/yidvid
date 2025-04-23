
import { useCallback } from "react";

export interface SampleChannel {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url?: string | null;
}

export const useSampleChannels = () => {
  // Function to create sample channel data
  const createSampleChannels = useCallback((): SampleChannel[] => {
    return [
      {
        id: "sample-1",
        channel_id: "sample-channel-1",
        title: "Sample Channel 1",
        thumbnail_url: "https://picsum.photos/seed/sample1/50/50"
      },
      {
        id: "sample-2",
        channel_id: "sample-channel-2",
        title: "Sample Channel 2",
        thumbnail_url: "https://picsum.photos/seed/sample2/50/50"
      },
      {
        id: "sample-3",
        channel_id: "sample-channel-3",
        title: "Sample Channel 3",
        thumbnail_url: "https://picsum.photos/seed/sample3/50/50"
      },
      {
        id: "sample-4",
        channel_id: "sample-channel-4",
        title: "Sample Channel 4",
        thumbnail_url: "https://picsum.photos/seed/sample4/50/50"
      }
    ];
  }, []);

  // Function to check if we have real channel data or just samples
  const hasRealChannels = useCallback((channels?: any[] | null): boolean => {
    if (!channels || channels.length === 0) return false;
    
    // Check if these are sample channels (contains 'sample' in the ID)
    const sampleCount = channels.filter(c => 
      c.id?.toString().includes('sample') || 
      c.channel_id?.includes('sample')
    ).length;
    
    // If all channels are samples, return false
    return sampleCount < channels.length;
  }, []);

  return {
    createSampleChannels,
    hasRealChannels
  };
};
