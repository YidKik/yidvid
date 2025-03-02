
export interface YoutubeChannelsTable {
  Row: {
    channel_id: string;
    created_at: string;
    description: string | null;
    id: string;
    thumbnail_url: string | null;
    title: string;
    updated_at: string;
    deleted_at?: string | null;
    default_category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom";
    fetch_error?: string | null;
    last_fetch?: string | null;
  };
  Insert: {
    channel_id: string;
    created_at?: string;
    description?: string | null;
    id?: string;
    thumbnail_url?: string | null;
    title: string;
    updated_at?: string;
    deleted_at?: string | null;
    default_category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom";
    fetch_error?: string | null;
    last_fetch?: string | null;
  };
  Update: {
    channel_id?: string;
    created_at?: string;
    description?: string | null;
    id?: string;
    thumbnail_url?: string | null;
    title?: string;
    updated_at?: string;
    deleted_at?: string | null;
    default_category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom";
    fetch_error?: string | null;
    last_fetch?: string | null;
  };
  Relationships: [];
}
