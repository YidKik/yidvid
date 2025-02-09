
export interface YoutubeChannelsTable {
  Row: {
    channel_id: string;
    created_at: string;
    description: string | null;
    id: string;
    thumbnail_url: string | null;
    title: string;
    updated_at: string;
    default_category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";
  };
  Insert: {
    channel_id: string;
    created_at?: string;
    description?: string | null;
    id?: string;
    thumbnail_url?: string | null;
    title: string;
    updated_at?: string;
    default_category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";
  };
  Update: {
    channel_id?: string;
    created_at?: string;
    description?: string | null;
    id?: string;
    thumbnail_url?: string | null;
    title?: string;
    updated_at?: string;
    default_category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";
  };
  Relationships: [];
}
