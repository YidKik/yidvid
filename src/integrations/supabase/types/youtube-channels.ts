export interface YoutubeChannelsTable {
  Row: {
    channel_id: string;
    created_at: string;
    description: string | null;
    id: string;
    thumbnail_url: string | null;
    title: string;
    updated_at: string;
  };
  Insert: {
    channel_id: string;
    created_at?: string;
    description?: string | null;
    id?: string;
    thumbnail_url?: string | null;
    title: string;
    updated_at?: string;
  };
  Update: {
    channel_id?: string;
    created_at?: string;
    description?: string | null;
    id?: string;
    thumbnail_url?: string | null;
    title?: string;
    updated_at?: string;
  };
  Relationships: [];
}