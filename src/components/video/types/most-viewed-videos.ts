
export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number;
  uploadedAt: string | Date;
}

export interface MostViewedVideosProps {
  videos: VideoInfo[];
}
