
export interface Channel {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url?: string;
  default_category?: string;
  updated_at: string;
}

export interface CategoryStats {
  category: string;
  count: number;
}

export interface RecentChange {
  id: string;
  channel_id: string;
  channel_title: string;
  old_category: string;
  new_category: string;
  timestamp: Date;
}

export type VideoCategory = "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";

export const categories = [
  { value: 'music' as const, label: 'Music', icon: '🎵' },
  { value: 'torah' as const, label: 'Torah', icon: '📖' },
  { value: 'inspiration' as const, label: 'Inspiration', icon: '✨' },
  { value: 'podcast' as const, label: 'Podcasts', icon: '🎙️' },
  { value: 'education' as const, label: 'Education', icon: '🎓' },
  { value: 'entertainment' as const, label: 'Entertainment', icon: '🎬' },
  { value: 'other' as const, label: 'Other', icon: '📁' },
];

export const validCategories: VideoCategory[] = ['music', 'torah', 'inspiration', 'podcast', 'education', 'entertainment', 'other'];
