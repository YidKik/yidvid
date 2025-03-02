
/**
 * Types for the video fetcher functionality
 */

export interface VideoData {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number;
  uploadedAt: string | Date;
}

export interface VideoFetcherResult {
  fetchAllVideos: () => Promise<VideoData[]>;
  fetchAttempts: number;
  lastSuccessfulFetch: Date | null;
  setFetchAttempts: (value: number | ((prev: number) => number)) => void;
  setLastSuccessfulFetch: (value: Date | null) => void;
}

export interface ChannelData {
  channel_id: string;
}
