
export interface VideoData {
  id: string;
  video_id: string;
  title: string;
  description?: string;
  thumbnail: string;
  channel_name: string;
  channel_id: string;
  views: number;
  uploaded_at: Date | string;
  updated_at: Date | string;
  created_at: Date | string;
  duration?: string | null;
  channelThumbnail?: string | null;
  category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom" | null;
}

export interface ChannelData {
  channel_id: string;
  thumbnail_url?: string | null;
}
