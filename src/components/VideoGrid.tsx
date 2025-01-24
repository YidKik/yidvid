import { useEffect, useState } from "react";
import { VideoCard } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Channel {
  channel_id: string;
  title: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  video_id: string;
  channel_name: string;
  channel_id: string;
  uploaded_at: string;
  views: number;
  youtube_channels?: {
    channel_id: string;
    thumbnail_url: string;
  };
}

interface VideoGridProps {
  channels?: Channel[];
  selectedChannel?: string | null;
  searchQuery?: string;
  maxVideos?: number;
  rowSize?: number;
}

export const VideoGrid = ({ 
  channels = [], 
  selectedChannel = null, 
  searchQuery = "",
  maxVideos = 12,
  rowSize = 4
}: VideoGridProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchVideos = async () => {
    try {
      console.log('Fetching videos...');
      const { data: videosData, error } = await supabase
        .from("youtube_videos")
        .select(`
          *,
          youtube_channels (
            channel_id,
            thumbnail_url
          )
        `)
        .order('uploaded_at', { ascending: false })
        .limit(maxVideos);

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error(`Error fetching videos: ${error.message}`);
        throw error;
      }

      console.log('Fetched videos:', videosData);
      return videosData || [];
    } catch (error) {
      console.error('Error in fetchVideos:', error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchVideos();
      }
      throw error;
    }
  };

  const { data: videos = [], error } = useQuery({
    queryKey: ['videos', searchQuery, maxVideos],
    queryFn: fetchVideos,
    retry: MAX_RETRIES,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  useEffect(() => {
    setIsLoading(false);
  }, [videos]);

  if (error) {
    console.error('Error loading videos:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading videos. Please try again later.</p>
      </div>
    );
  }

  const filteredVideos = videos.filter(video => {
    const matchesChannel = !selectedChannel || video.channel_id === selectedChannel;
    const matchesSearch = !searchQuery || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.channel_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  }).slice(0, maxVideos);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading videos...</p>
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No videos found.</p>
      </div>
    );
  }

  // Create rows of videos
  const rows = [];
  for (let i = 0; i < filteredVideos.length; i += rowSize) {
    rows.push(filteredVideos.slice(i, i + rowSize));
  }

  return (
    <div className="space-y-8 p-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {row.map((video, index) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnail={video.thumbnail}
              channelName={video.channel_name}
              views={video.views}
              uploadedAt={new Date(video.uploaded_at)}
              channelId={video.channel_id}
              channelThumbnail={video.youtube_channels?.thumbnail_url}
              index={rowIndex * rowSize + index}
            />
          ))}
        </div>
      ))}
    </div>
  );
};