import React, { useState, useEffect } from "react";
import { VideoCard } from "./VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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

  // Fetch videos using React Query with better error handling
  const { data: rawVideos, isLoading: loadingVideos, error } = useQuery({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      console.log("Fetching videos...");
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }

      console.log("Fetched videos:", data);
      // Map the raw data to match the expected interface
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
    retry: 3, // Retry failed requests 3 times
    refetchOnWindowFocus: true, // Refresh data when window regains focus
  });

  // Load hidden channels from database
  useEffect(() => {
    const loadHiddenChannels = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found");
        return;
      }

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

  // Subscribe to real-time updates
  useEffect(() => {
    console.log("Setting up real-time subscription");
    const channel = supabase
      .channel('youtube_videos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_videos'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Invalidate and refetch the videos query
          // queryClient.invalidateQueries({ queryKey: ['youtube_videos'] });
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
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

  const videosPerPage = isMobile ? 4 : rowSize * 3;

  // Filter out videos from hidden channels
  const filteredVideos = rawVideos ? rawVideos.filter(
    (video) => !hiddenChannels.has(video.channelId)
  ) : [];

  // Get unique channel videos for the first page only if not showing all
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

  const totalPages = Math.ceil(
    (showAll ? filteredVideos.length : firstPageVideos.length) / videosPerPage
  );
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  
  const currentVideos = !showAll
    ? firstPageVideos.slice(0, maxVideos)
    : filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loadingVideos) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-[1600px] mx-auto">
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

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-[1600px] mx-auto">
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
      
      <div className="flex flex-col items-center gap-3 md:gap-4 mt-6 md:mt-8">
        {!showAll && filteredVideos.length > maxVideos && (
          <Button 
            onClick={() => {
              setShowAll(true);
              setCurrentPage(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            variant="outline"
            className="w-32 md:w-40 text-sm md:text-base"
          >
            See More
          </Button>
        )}
        
        {showAll && totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} text-sm md:text-base`}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} text-sm md:text-base`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
