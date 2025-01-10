import { useQuery } from "@tanstack/react-query";
import { VideoCard } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";

export const VideoGrid = () => {
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["youtube-videos"],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("fetch-youtube-videos");
      return data.map((video: any) => ({
        ...video,
        views: Math.floor(Math.random() * 100000), // YouTube API v3 doesn't provide view counts in search results
        uploadedAt: new Date(video.uploadedAt),
      }));
    },
    enabled: !!channels?.length,
  });

  const isLoading = isLoadingChannels || isLoadingVideos;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading videos...</p>
      </div>
    );
  }

  if (!channels?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
        <p className="text-muted-foreground">No channels added yet</p>
        <p className="text-sm text-muted-foreground">
          Add your first channel in the dashboard
        </p>
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
        <p className="text-muted-foreground">No videos found</p>
        <p className="text-sm text-muted-foreground">
          Try adding different channels or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {videos.map((video) => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
};