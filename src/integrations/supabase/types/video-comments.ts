export interface VideoCommentsTable {
  Row: {
    content: string;
    created_at: string;
    id: string;
    updated_at: string;
    user_id: string | null;
    video_id: string | null;
  };
  Insert: {
    content: string;
    created_at?: string;
    id?: string;
    updated_at?: string;
    user_id?: string | null;
    video_id?: string | null;
  };
  Update: {
    content?: string;
    created_at?: string;
    id?: string;
    updated_at?: string;
    user_id?: string | null;
    video_id?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "video_comments_video_id_fkey";
      columns: ["video_id"];
      isOneToOne: false;
      referencedRelation: "youtube_videos";
      referencedColumns: ["id"];
    }
  ];
}