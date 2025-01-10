import { useQuery } from "@tanstack/react-query";
import { VideoCard } from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";

export const VideoGrid = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    // Listen for auth changes
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
    queryKey: ["youtube-videos", session?.user?.id],
    queryFn: async () => {
      toast({
        title: "Fetching videos...",
        description: "This may take a few moments",
      });

      // First, fetch new videos from YouTube
      const { error: fetchError } = await supabase.functions.invoke("fetch-youtube-videos");
      
      if (fetchError) {
        console.error("Error fetching videos from YouTube:", fetchError);
        toast({
          title: "Error fetching videos",
          description: "Please try again later",
          variant: "destructive",
        });
        throw fetchError;
      }

      let query = supabase
        .from("youtube_videos")
        .select("*");

      // If user is authenticated, try to personalize the feed
      if (session?.user) {
        // Order by most recent first, but we could add more sophisticated
        // personalization logic here based on user preferences or viewing history
        query = query.order("uploaded_at", { ascending: false });
      } else {
        // For non-authenticated users, show random videos
        query = query.order("uploaded_at", { ascending: false });
      }

      const { data, error } = await query;

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
    },
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

  return (
    <div className="space-y-4">
      {!videos?.length ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
          <p className="text-muted-foreground">No videos found</p>
          <p className="text-sm text-muted-foreground">
            Videos will appear here once they are fetched from your channels
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