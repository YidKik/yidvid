import { useQuery } from "@tanstack/react-query";
import { VideoCard } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

export const VideoGrid = () => {
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["youtube-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching channels:", error);
        throw error;
      }
      
      console.log("Fetched channels:", data);
      return data;
    },
  });

  const { data: videos, isLoading: isLoadingVideos, refetch: refetchVideos } = useQuery({
    queryKey: ["youtube-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }

      console.log("Fetched videos:", data);
      return data.map((video: any) => ({
        ...video,
        uploadedAt: new Date(video.uploaded_at),
      }));
    },
  });

  const handleManualFetch = async () => {
    try {
      toast({
        title: "Fetching videos...",
        description: "This may take a few moments",
      });

      const { error } = await supabase.functions.invoke("fetch-youtube-videos");
      
      if (error) throw error;
      
      await refetchVideos();
      
      toast({
        title: "Videos fetched successfully",
        description: "Your feed has been updated",
      });
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast({
        title: "Error fetching videos",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="space-y-4">
      <div className="flex justify-end px-4">
        <Button onClick={handleManualFetch}>
          Fetch Latest Videos
        </Button>
      </div>
      {!videos?.length ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
          <p className="text-muted-foreground">No videos found</p>
          <p className="text-sm text-muted-foreground">
            Click the button above to fetch videos from your channels
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {videos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      )}
    </div>
  );
};