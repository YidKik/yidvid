
import { Channel } from "./useChannelsGrid";

export const useSampleChannels = () => {
  const createSampleChannels = (count: number = 8): Channel[] => {
    return Array(count).fill(null).map((_, i) => ({
      id: `sample-${i}`,
      channel_id: `sample-channel-${i}`,
      title: `Sample Channel ${i+1}`,
      thumbnail_url: null
    }));
  };

  const hasRealChannels = (data?: Channel[]) => {
    if (!data || data.length === 0) return false;
    return data.some(c => 
      !c.id.toString().includes('sample') && 
      !c.channel_id.includes('sample') &&
      c.title !== "Sample Channel 1"
    );
  };

  return {
    createSampleChannels,
    hasRealChannels
  };
};
