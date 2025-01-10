import { ProfilesTable } from './profiles';
import { VideoCommentsTable } from './video-comments';
import { YoutubeChannelsTable } from './youtube-channels';
import { YoutubeVideosTable } from './youtube-videos';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: ProfilesTable;
      video_comments: VideoCommentsTable;
      youtube_channels: YoutubeChannelsTable;
      youtube_videos: YoutubeVideosTable;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}