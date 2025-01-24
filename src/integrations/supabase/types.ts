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
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_admin: boolean | null
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string
        }
        Update: {
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
      youtube_channels: {
        Row: {
          channel_id: string
          created_at: string
          description: string | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          channel_id: string
          channel_name: string
          created_at: string
          description: string | null
          id: string
          thumbnail: string
          title: string
          updated_at: string
          uploaded_at: string
          video_id: string
          views: number | null
        }
        Insert: {
          channel_id: string
          channel_name: string
          created_at?: string
          description?: string | null
          id?: string
          thumbnail: string
          title: string
          updated_at?: string
          uploaded_at: string
          video_id: string
          views?: number | null
        }
        Update: {
          channel_id?: string
          channel_name?: string
          created_at?: string
          description?: string | null
          id?: string
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
      [_ in never]: never
    }
    Enums: {
      interaction_type_enum: "view" | "like" | "dislike" | "save"
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
