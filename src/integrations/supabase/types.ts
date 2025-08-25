export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_email_settings: {
        Row: {
          admin_id: string
          created_at: string
          email: string
          id: string
          receive_contact_notifications: boolean | null
          receive_general_notifications: boolean | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          email: string
          id?: string
          receive_contact_notifications?: boolean | null
          receive_general_notifications?: boolean | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          email?: string
          id?: string
          receive_contact_notifications?: boolean | null
          receive_general_notifications?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_email_settings_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      admin_sessions: {
        Row: {
          admin_token: string
          created_at: string
          expires_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_token: string
          created_at?: string
          expires_at: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_quota_tracking: {
        Row: {
          api_name: string
          created_at: string | null
          id: string
          last_reset: string
          quota_remaining: number
          quota_reset_at: string
          updated_at: string | null
        }
        Insert: {
          api_name: string
          created_at?: string | null
          id?: string
          last_reset?: string
          quota_remaining?: number
          quota_reset_at: string
          updated_at?: string | null
        }
        Update: {
          api_name?: string
          created_at?: string | null
          id?: string
          last_reset?: string
          quota_remaining?: number
          quota_reset_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempt_type: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          first_attempt_at: string | null
          id: string
          identifier: string
          last_attempt_at: string | null
        }
        Insert: {
          attempt_type: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier: string
          last_attempt_at?: string | null
        }
        Update: {
          attempt_type?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier?: string
          last_attempt_at?: string | null
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
          admin_reply: string | null
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          replied_at: string | null
          replied_by: string | null
          responded_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          category?: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          replied_at?: string | null
          replied_by?: string | null
          responded_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          replied_at?: string | null
          replied_by?: string | null
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
      global_notifications: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          message: string
          start_date: string
          title: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          start_date?: string
          title?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          start_date?: string
          title?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      layout_configurations: {
        Row: {
          created_at: string
          desktop_order: number
          id: string
          mobile_order: number
          name: string
          spacing: Json
          updated_at: string
          visibility: Json
        }
        Insert: {
          created_at?: string
          desktop_order?: number
          id?: string
          mobile_order?: number
          name: string
          spacing?: Json
          updated_at?: string
          visibility?: Json
        }
        Update: {
          created_at?: string
          desktop_order?: number
          id?: string
          mobile_order?: number
          name?: string
          spacing?: Json
          updated_at?: string
          visibility?: Json
        }
        Relationships: []
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
      parental_locks: {
        Row: {
          created_at: string
          id: string
          is_locked: boolean | null
          lock_type: Database["public"]["Enums"]["lock_type"]
          pin: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_locked?: boolean | null
          lock_type: Database["public"]["Enums"]["lock_type"]
          pin: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_locked?: boolean | null
          lock_type?: Database["public"]["Enums"]["lock_type"]
          pin?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          child_name: string | null
          created_at: string
          display_name: string | null
          email: string
          email_notifications: boolean | null
          id: string
          is_admin: boolean | null
          name: string | null
          updated_at: string
          user_type: string | null
          username: string | null
          welcome_name: string | null
          welcome_popup_shown: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          child_name?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          email_notifications?: boolean | null
          id: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          welcome_name?: string | null
          welcome_popup_shown?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          child_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          email_notifications?: boolean | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          welcome_name?: string | null
          welcome_popup_shown?: boolean | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          display_order: number | null
          id: string
          is_visible: boolean | null
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
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
      video_fetch_logs: {
        Row: {
          channels_processed: number | null
          error: string | null
          fetch_time: string
          id: string
          quota_remaining: number | null
          videos_found: number | null
        }
        Insert: {
          channels_processed?: number | null
          error?: string | null
          fetch_time?: string
          id?: string
          quota_remaining?: number | null
          videos_found?: number | null
        }
        Update: {
          channels_processed?: number | null
          error?: string | null
          fetch_time?: string
          id?: string
          quota_remaining?: number | null
          videos_found?: number | null
        }
        Relationships: []
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
      youtube_update_logs: {
        Row: {
          channel_id: string
          created_at: string
          error: string | null
          id: string
          videos_count: number | null
        }
        Insert: {
          channel_id: string
          created_at?: string
          error?: string | null
          id?: string
          videos_count?: number | null
        }
        Update: {
          channel_id?: string
          created_at?: string
          error?: string | null
          id?: string
          videos_count?: number | null
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
          updated_at: string
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
      admin_delete_channel: {
        Args: { admin_user_id: string; channel_id_param: string }
        Returns: Json
      }
      admin_delete_video: {
        Args: { admin_user_id: string; video_id_param: string }
        Returns: Json
      }
      admin_restore_channel: {
        Args: { admin_user_id: string; channel_id_param: string }
        Returns: Json
      }
      admin_restore_video: {
        Args: { admin_user_id: string; video_id_param: string }
        Returns: Json
      }
      check_admin_rate_limit: {
        Args: { operation_type: string }
        Returns: boolean
      }
      cleanup_expired_admin_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fetch_overdue_channels: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_next_midnight_utc: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      invalidate_admin_session: {
        Args: { session_token: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      trigger_youtube_video_fetch: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      interaction_type_enum: "view" | "like" | "dislike" | "save"
      lock_type: "channel_control"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      interaction_type_enum: ["view", "like", "dislike", "save"],
      lock_type: ["channel_control"],
      music_genre: [
        "pop",
        "rock",
        "hip_hop",
        "jazz",
        "classical",
        "electronic",
        "other",
      ],
      video_category: [
        "music",
        "torah",
        "inspiration",
        "podcast",
        "education",
        "entertainment",
        "other",
        "custom",
      ],
    },
  },
} as const
