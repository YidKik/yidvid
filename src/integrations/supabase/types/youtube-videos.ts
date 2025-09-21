
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
    content_analysis_status?: "pending" | "approved" | "rejected" | "manual_review" | null;
    analysis_details?: any | null;
    analysis_score?: number | null;
    analysis_timestamp?: string | null;
    manual_review_required?: boolean | null;
    reviewed_by?: string | null;
    reviewed_at?: Date | null;
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
    content_analysis_status?: "pending" | "approved" | "rejected" | "manual_review" | null;
    analysis_details?: any | null;
    analysis_score?: number | null;
    analysis_timestamp?: string | null;
    manual_review_required?: boolean | null;
    reviewed_by?: string | null;
    reviewed_at?: Date | null;
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
    content_analysis_status?: "pending" | "approved" | "rejected" | "manual_review" | null;
    analysis_details?: any | null;
    analysis_score?: number | null;
    analysis_timestamp?: string | null;
    manual_review_required?: boolean | null;
    reviewed_by?: string | null;
    reviewed_at?: Date | null;
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
