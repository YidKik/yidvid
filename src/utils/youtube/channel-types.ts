
export interface ManualChannelData {
  channel_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  default_category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";
}
