import React, { useState, useEffect } from "react";
import { VideoCard } from "./VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridPagination } from "./video/VideoGridPagination";

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

export const VideoGrid = ({ maxVideos = 12, rowSize = 4, isLoading: parentLoading }: VideoGridProps) => {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();
  
  const { data: videos, isLoading } = useQuery({
    queryKey: ["youtube_videos_grid"],
    queryFn: async () => {
      console.log("VideoGrid: Fetching videos...");
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("VideoGrid: Error fetching videos:", error);
        toast.error("Failed to load videos");
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
    },
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
  });

  useEffect(() => {
    const loadHiddenChannels = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: hiddenChannelsData, error } = await supabase
        .from('hidden_channels')
        .select('channel_id')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error loading hidden channels:', error);
        toast.error("Failed to load channel preferences");
        return;
      }

      setHiddenChannels(new Set(hiddenChannelsData.map(hc => hc.channel_id)));
    };

    loadHiddenChannels();
  }, []);

  if (isLoading || parentLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-[1600px] mx-auto`}>
        {Array.from({ length: isMobile ? 4 : maxVideos }).map((_, index) => (
          <div key={index} className="space-y-2 md:space-y-3">
            <Skeleton className="aspect-video w-full" />
            <div className="flex gap-2 md:gap-3">
              <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
              <div className="space-y-1 md:space-y-2 flex-1">
                <Skeleton className="h-3 md:h-4 w-full" />
                <Skeleton className="h-3 md:h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredVideos = videos ? videos.filter(
    (video) => !hiddenChannels.has(video.channelId)
  ) : [];

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

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No videos available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-[1600px] mx-auto`}>
        {currentVideos?.map((video) => (
          <VideoCard
            key={video.id}
            id={video.video_id}
            uuid={video.id}
            title={video.title}
            thumbnail={video.thumbnail}
            channelName={video.channelName}
            views={video.views}
            uploadedAt={video.uploadedAt}
          />
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
}
