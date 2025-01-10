import { useQuery } from "@tanstack/react-query";
import { VideoCard } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { VideoGridHeader } from "./video/VideoGridHeader";

export const VideoGrid = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["youtube-videos", channels],
    queryFn: async () => {
      if (!channels?.length) {
        return [];
      }

      toast({
        title: "Fetching videos...",
        description: "This may take a few moments",
      });

      try {
        const { error: fetchError, data: fetchData } = await supabase.functions.invoke("fetch-youtube-videos", {
          body: { channels: channels.map(c => c.channel_id) }
        });
        
        if (fetchError) {
          console.error("Error fetching videos from YouTube:", fetchError);
          toast({
            title: "Error fetching videos",
            description: "Please try again later",
            variant: "destructive",
          });
          throw fetchError;
        }

        console.log("Edge function response:", fetchData);

        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .order("uploaded_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          throw error;
        }

        toast({
          title: "Videos fetched successfully",
          description: session?.user 
            ? "Your personalized feed has been updated"
            : "Showing recommended videos",
        });

        console.log("Fetched videos:", data);
        return data.map((video: any) => ({
          ...video,
          uploadedAt: new Date(video.uploaded_at),
        }));
      } catch (error) {
        console.error("Error in video fetch process:", error);
        toast({
          title: "Error fetching videos",
          description: "Please try again later",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!channels?.length,
  });

  const isLoading = isLoadingChannels || isLoadingVideos;

  return (
    <div className="space-y-4">
      <VideoGridHeader 
        isLoading={isLoading}
        hasChannels={!!channels?.length}
        hasVideos={!!videos?.length}
      />
      
      {videos?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {videos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      )}
    </div>
  );
};