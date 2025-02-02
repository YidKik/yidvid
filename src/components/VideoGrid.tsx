import React, { useState, useEffect } from "react";
import { VideoCard } from "./VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export default function VideoGrid({ maxVideos = 12, rowSize = 4, isLoading }: VideoGridProps) {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["youtube_videos"],
      queryFn: fetchVideos,
    });
  }, [queryClient]);

  const fetchVideos = async () => {
    console.log("Fetching videos...");
    const { data, error } = await supabase
      .from("youtube_videos")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) throw error;

    console.log(`Fetched ${data?.length || 0} videos`);
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
  };

  const { data: rawVideos, isLoading: loadingVideos, error } = useQuery({
    queryKey: ["youtube_videos"],
    queryFn: fetchVideos,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
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

  if (error) {
    console.error("Error in VideoGrid:", error);
    toast.error("Failed to load videos. Please try again later.");
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Failed to load videos. Please try again later.</p>
      </div>
    );
  }

  const filteredVideos = rawVideos ? rawVideos.filter(
    (video) => !hiddenChannels.has(video.channelId)
  ) : [];

  const firstPageVideos = filteredVideos.reduce((acc, current) => {
    const existingVideo = acc.find(video => video.channelId === current.channelId);
    if (!existingVideo) {
      acc.push(current);
    } else {
      const existingDate = new Date(existingVideo.uploadedAt);
      const currentDate = new Date(current.uploadedAt);
      if (currentDate > existingDate) {
        const index = acc.findIndex(video => video.channelId === current.channelId);
        acc[index] = current;
      }
    }
    return acc;
  }, [] as VideoGridProps['videos']);

  const videosPerPage = isMobile ? 4 : rowSize * 3;

  const totalPages = Math.ceil(
    (showAll ? filteredVideos.length : firstPageVideos.length) / videosPerPage
  );
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  
  const currentVideos = !showAll
    ? firstPageVideos.slice(0, isMobile ? 4 : maxVideos)
    : filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);

  if (loadingVideos) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-[1600px] mx-auto`}>
        {Array.from({ length: isMobile ? 8 : maxVideos }).map((_, index) => (
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowAll = () => {
    setShowAll(true);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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