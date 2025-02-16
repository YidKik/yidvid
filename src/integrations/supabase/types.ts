export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      channel_category_mappings: {
        Row: {
          category_id: string
          channel_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          category_id: string
          channel_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          channel_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_category_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "custom_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_category_mappings_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["channel_id"]
          },
        ]
      }
      channel_custom_category_mappings: {
        Row: {
          category_id: string | null
          channel_id: string | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          channel_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          channel_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_custom_category_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "custom_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_custom_category_mappings_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["channel_id"]
          },
        ]
      }
      channel_requests: {
        Row: {
          channel_id: string | null
          channel_name: string
          created_at: string
          id: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          channel_name: string
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          channel_name?: string
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_subscriptions: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_subscriptions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["channel_id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          responded_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          responded_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          responded_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cron_job_logs: {
        Row: {
          created_at: string
          id: string
          job_name: string
          response: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_name: string
          response?: Json | null
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          job_name?: string
          response?: Json | null
          status?: string
        }
        Relationships: []
      }
      custom_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_emoji: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          is_emoji?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_emoji?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      hidden_channels: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hidden_channels_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["channel_id"]
          },
        ]
      }
      music_albums: {
        Row: {
          artist_id: string
          created_at: string
          id: string
          release_date: string | null
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          id?: string
          release_date?: string | null
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          id?: string
          release_date?: string | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_albums_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "music_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      music_artists: {
        Row: {
          artist_id: string
          created_at: string
          description: string | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      music_playlist_tracks: {
        Row: {
          created_at: string
          id: string
          playlist_id: string | null
          position: number
          track_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          playlist_id?: string | null
          position: number
          track_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          playlist_id?: string | null
          position?: number
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "music_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      music_playlists: {
        Row: {
          created_at: string
          id: string
          thumbnail: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          thumbnail?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          thumbnail?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      music_tracks: {
        Row: {
          album_id: string | null
          artist_id: string
          artist_name: string
          audio_url: string | null
          created_at: string
          duration: number | null
          genre: Database["public"]["Enums"]["music_genre"] | null
          id: string
          plays: number | null
          thumbnail: string
          title: string
          track_id: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          album_id?: string | null
          artist_id: string
          artist_name: string
          audio_url?: string | null
          created_at?: string
          duration?: number | null
          genre?: Database["public"]["Enums"]["music_genre"] | null
          id?: string
          plays?: number | null
          thumbnail: string
          title: string
          track_id: string
          updated_at?: string
          uploaded_at: string
        }
        Update: {
          album_id?: string | null
          artist_id?: string
          artist_name?: string
          audio_url?: string | null
          created_at?: string
          duration?: number | null
          genre?: Database["public"]["Enums"]["music_genre"] | null
          id?: string
          plays?: number | null
          thumbnail?: string
          title?: string
          track_id?: string
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "music_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "music_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          is_admin: boolean | null
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string
          id: string
          page_path: string
          session_end: string | null
          session_start: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          session_end?: string | null
          session_start?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          session_end?: string | null
          session_start?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          autoplay: boolean
          background_color: string
          button_color: string
          created_at: string
          id: string
          language: string
          logo_color: string
          text_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          autoplay?: boolean
          background_color?: string
          button_color?: string
          created_at?: string
          id?: string
          language?: string
          logo_color?: string
          text_color?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          autoplay?: boolean
          background_color?: string
          button_color?: string
          created_at?: string
          id?: string
          language?: string
          logo_color?: string
          text_color?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_video_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: Database["public"]["Enums"]["interaction_type_enum"]
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: Database["public"]["Enums"]["interaction_type_enum"]
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type_enum"]
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_video_interactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_category_mappings: {
        Row: {
          category_id: string
          created_at: string
          id: string
          updated_at: string
          video_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          updated_at?: string
          video_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_category_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "custom_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_category_mappings_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
          video_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          video_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_comments_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_custom_category_mappings: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_custom_category_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "custom_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_custom_category_mappings_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_history: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          video_id: string
          watched_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          video_id: string
          watched_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          video_id?: string
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_history_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_notifications_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_reports: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_reports_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_assistant_interactions: {
        Row: {
          created_at: string
          id: string
          query: string
          response: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          response: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          response?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      youtube_channels: {
        Row: {
          channel_id: string
          created_at: string
          default_category: Database["public"]["Enums"]["video_category"] | null
          deleted_at: string | null
          description: string | null
          fetch_error: string | null
          id: string
          last_fetch: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          default_category?:
            | Database["public"]["Enums"]["video_category"]
            | null
          deleted_at?: string | null
          description?: string | null
          fetch_error?: string | null
          id?: string
          last_fetch?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          default_category?:
            | Database["public"]["Enums"]["video_category"]
            | null
          deleted_at?: string | null
          description?: string | null
          fetch_error?: string | null
          id?: string
          last_fetch?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          category: Database["public"]["Enums"]["video_category"] | null
          channel_id: string
          channel_name: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          last_viewed_at: string | null
          thumbnail: string
          title: string
          updated_at: string
          uploaded_at: string
          video_id: string
          views: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["video_category"] | null
          channel_id: string
          channel_name: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          last_viewed_at?: string | null
          thumbnail: string
          title: string
          updated_at?: string
          uploaded_at: string
          video_id: string
          views?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["video_category"] | null
          channel_id?: string
          channel_name?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          last_viewed_at?: string | null
          thumbnail?: string
          title?: string
          updated_at?: string
          uploaded_at?: string
          video_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_videos_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["channel_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fetch_overdue_channels: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      trigger_youtube_video_fetch: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      interaction_type_enum: "view" | "like" | "dislike" | "save"
      music_genre:
        | "pop"
        | "rock"
        | "hip_hop"
        | "jazz"
        | "classical"
        | "electronic"
        | "other"
      video_category:
        | "music"
        | "torah"
        | "inspiration"
        | "podcast"
        | "education"
        | "entertainment"
        | "other"
        | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
