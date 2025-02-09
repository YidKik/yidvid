
export interface YoutubeVideosTable {
  Row: {
    channel_id: string;
    channel_name: string;
    created_at: string;
    id: string;
    thumbnail: string;
    title: string;
    updated_at: string;
    uploaded_at: string;
    video_id: string;
    views: number | null;
    category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";
  };
  Insert: {
    channel_id: string;
    channel_name: string;
    created_at?: string;
    id?: string;
    thumbnail: string;
    title: string;
    updated_at?: string;
    uploaded_at: string;
    video_id: string;
    views?: number | null;
    category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";
  };
  Update: {
    channel_id?: string;
    channel_name?: string;
    created_at?: string;
    id?: string;
    thumbnail?: string;
    title?: string;
    updated_at?: string;
    uploaded_at?: string;
    video_id?: string;
    views?: number | null;
    category?: "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other";
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
