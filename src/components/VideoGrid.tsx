import { useQuery } from "@tanstack/react-query";
import { VideoCard } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";

export const VideoGrid = () => {
  const { data: channels, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading channels...</p>
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

  // For now, we'll use mock videos but associate them with the actual channels
  const channelVideos = channels.flatMap((channel) => [
    {
      id: `${channel.id}-1`,
      title: "Understanding the Weekly Torah Portion",
      thumbnail: "https://i.ytimg.com/vi/1234/maxresdefault.jpg",
      channelName: channel.title,
      views: 15000,
      uploadedAt: new Date(),
    },
    {
      id: `${channel.id}-2`,
      title: "The Meaning Behind Jewish Traditions",
      thumbnail: "https://i.ytimg.com/vi/5678/maxresdefault.jpg",
      channelName: channel.title,
      views: 25000,
      uploadedAt: new Date(),
    },
  ]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {channelVideos.map((video) => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
};