
export interface VideoData {
  id: string;
  video_id: string;
  title: string;
  description?: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number;
  uploadedAt: string;
  updatedAt: string;
  createdAt: string;
  duration?: string | null;
  channelThumbnail?: string | null;
}

export interface ChannelData {
  channel_id: string;
  thumbnail_url?: string | null;
}
