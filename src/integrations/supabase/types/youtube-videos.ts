
export interface YoutubeVideosTable {
  Row: {
    channel_id: string;
    channel_name: string;
    created_at: Date;
    id: string;
    thumbnail: string;
    title: string;
    updated_at: Date;
    uploaded_at: Date;
    video_id: string;
    views: number | null;
    category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom" | null;
    deleted_at?: Date | null;
    description?: string | null;
    last_viewed_at?: Date | null;
  };
  Insert: {
    channel_id: string;
    channel_name: string;
    created_at?: Date;
    id?: string;
    thumbnail: string;
    title: string;
    updated_at?: Date;
    uploaded_at: Date;
    video_id: string;
    views?: number | null;
    category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom" | null;
    deleted_at?: Date | null;
    description?: string | null;
    last_viewed_at?: Date | null;
  };
  Update: {
    channel_id?: string;
    channel_name?: string;
    created_at?: Date;
    id?: string;
    thumbnail?: string;
    title?: string;
    updated_at?: Date;
    uploaded_at?: Date;
    video_id?: string;
    views?: number | null;
    category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom" | null;
    deleted_at?: Date | null;
    description?: string | null;
    last_viewed_at?: Date | null;
  };
  Relationships: [
    {
      foreignKeyName: "youtube_videos_channel_id_fkey";
      columns: ["channel_id"];
      isOneToOne: false;
      referencedRelation: "youtube_channels";
      referencedColumns: ["channel_id"];
    }
  ];
}
