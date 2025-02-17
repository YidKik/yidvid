
import { type FC, useState, useEffect } from "react";
import { VideoCard } from "./VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { VideoGridPagination } from "./video/VideoGridPagination";
import { toast } from "sonner";

interface VideoGridProps {
  videos?: {
    id: string;
    video_id: string;
    title: string;
    thumbnail: string;
    channelName: string;
    channelId: string;
    views: number;
    uploadedAt: string | Date;
  }[];
  maxVideos?: number;
  rowSize?: number;
  isLoading?: boolean;
}

export const VideoGrid: FC<VideoGridProps> = ({ maxVideos = 12, rowSize = 4, isLoading: parentLoading, videos: parentVideos }) => {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();
  
  const { data: videos, isLoading } = useQuery({
    queryKey: ["youtube_videos_grid"],
    queryFn: async () => {
      console.log("VideoGrid: Fetching videos...");

      try {
        // First check quota status
        const { data: quotaData } = await supabase
          .from('api_quota_tracking')
          .select('quota_remaining, quota_reset_at')
          .eq('api_name', 'youtube')
          .single();

        if (quotaData?.quota_remaining <= 0) {
          console.warn('YouTube API quota exceeded, fetching cached data only');
          toast.warning("API quota exceeded. Showing cached data until reset.");
        }

        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .is('deleted_at', null)
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("VideoGrid: Error fetching videos:", error);
          throw error;
        }

        console.log("VideoGrid: Fetched videos count:", data?.length || 0);
        return (data || []).map(video => ({
          id: video.id,
          video_id: video.video_id,
          title: video.title,
          thumbnail: video.thumbnail,
          channelName: video.channel_name,
          channelId: video.channel_id,
          views: video.views || 0,
          uploadedAt: video.uploaded_at
        }));
      } catch (error: any) {
        console.error("Error in queryFn:", error);
        
        // If quota exceeded, try to get cached data
        if (error.message?.includes('quota exceeded') || error?.status === 429) {
          toast.warning('API quota exceeded. Showing cached data.');
          
          const { data: cachedData } = await supabase
            .from("youtube_videos")
            .select("*")
            .is('deleted_at', null)
            .order("uploaded_at", { ascending: false });

          if (cachedData) {
            return cachedData.map(video => ({
              id: video.id,
              video_id: video.video_id,
              title: video.title,
              thumbnail: video.thumbnail,
              channelName: video.channel_name,
              channelId: video.channel_id,
              views: video.views || 0,
              uploadedAt: video.uploaded_at
            }));
          }
        }
        
        throw error;
      }
    },
    enabled: !parentVideos,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: (failureCount, error: any) => {
      // Don't retry on quota exceeded
      if (error?.status === 429) return false;
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
  });

  useEffect(() => {
    const loadHiddenChannels = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const { data: hiddenChannelsData, error } = await supabase
          .from('hidden_channels')
          .select('channel_id')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error loading hidden channels:', error);
          return;
        }

        setHiddenChannels(new Set(hiddenChannelsData?.map(hc => hc.channel_id) || []));
      } catch (error) {
        console.error('Error loading hidden channels:', error);
      }
    };

    loadHiddenChannels();
  }, []);

  const displayVideos = parentVideos || videos || [];
  const filteredVideos = displayVideos.filter(
    (video) => !hiddenChannels.has(video.channelId)
  );

  const videosPerPage = isMobile ? 4 : rowSize * 3;
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  
  const currentVideos = showAll
    ? filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo)
    : filteredVideos.slice(0, isMobile ? 4 : maxVideos);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowAll = () => {
    setShowAll(true);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading || parentLoading) {
    return (
      <div className={`grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:grid-cols-4 md:gap-4 max-w-[1600px] mx-auto`}>
        {Array.from({ length: isMobile ? 4 : maxVideos }).map((_, index) => (
          <div key={index} className="space-y-1 md:space-y-2">
            <Skeleton className="aspect-video w-full" />
            <div className="flex gap-1 md:gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No videos available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-6">
      <div className={`grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:grid-cols-4 md:gap-4 max-w-[1600px] mx-auto`}>
        {currentVideos?.map((video) => (
          <div 
            key={video.id} 
            className="transform transition-transform duration-200 hover:scale-102 hover:shadow-lg rounded-lg overflow-hidden"
          >
            <VideoCard
              id={video.video_id}
              uuid={video.id}
              title={video.title}
              thumbnail={video.thumbnail}
              channelName={video.channelName}
              views={video.views}
              uploadedAt={video.uploadedAt}
            />
          </div>
        ))}
      </div>
      
      <VideoGridPagination
        showAll={showAll}
        currentPage={currentPage}
        totalPages={totalPages}
        filteredVideosLength={filteredVideos.length}
        maxVideos={maxVideos}
        isMobile={isMobile}
        onShowAll={handleShowAll}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
