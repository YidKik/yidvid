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
  uploaded_at: string; // Changed to string since that's what we get from the DB
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
}

export const VideoGrid = ({ channels = [], selectedChannel = null, searchQuery = "" }: VideoGridProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchVideosForChannels = async () => {
    try {
      // Process channels in smaller batches to avoid URL length issues
      const batchSize = 1; // Process one channel at a time
      let allVideos: Video[] = [];
      
      for (let i = 0; i < channels.length; i += batchSize) {
        const batchChannels = channels.slice(i, i + batchSize);
        const channelIds = batchChannels.map(c => c.channel_id);
        
        console.log(`Fetching videos for channel ${channelIds[0]}`);
        
        const { data: videosData, error } = await supabase
          .from("youtube_videos")
          .select(`
            *,
            youtube_channels (
              channel_id,
              thumbnail_url
            )
          `)
          .in('channel_id', channelIds)
          .order('uploaded_at', { ascending: false });

        if (error) {
          console.error('Error fetching videos:', error);
          toast.error(`Error fetching videos: ${error.message}`);
          throw error;
        }

        if (videosData) {
          allVideos = [...allVideos, ...videosData];
        }

        // Add a delay between requests to prevent rate limiting
        if (i + batchSize < channels.length) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between requests
        }
      }

      return allVideos;
    } catch (error) {
      console.error('Error in fetchVideosForChannels:', error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        // Exponential backoff delay
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchVideosForChannels();
      }
      throw error;
    }
  };

  const { data: videos = [], error } = useQuery({
    queryKey: ['videos', channels, selectedChannel, searchQuery],
    queryFn: fetchVideosForChannels,
    enabled: channels.length > 0,
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
  });

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {filteredVideos.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          title={video.title}
          thumbnail={video.thumbnail}
          channelName={video.channel_name}
          views={video.views}
          uploadedAt={video.uploaded_at}
          channelThumbnail={video.youtube_channels?.thumbnail_url}
        />
      ))}
    </div>
  );
};