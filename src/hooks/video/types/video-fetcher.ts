

export interface VideoData {
  id: string;
  video_id: string;
  title: string;
  description?: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number;
  uploadedAt: Date;
  updatedAt: Date;
  createdAt: Date;
  duration?: string | null;
  channelThumbnail?: string | null;
}

export interface ChannelData {
  channel_id: string;
  thumbnail_url?: string | null;
}

