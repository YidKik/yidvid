import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, ChevronDown, ChevronUp, UserPlus, Check } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { BackButton } from "@/components/navigation/BackButton";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ChannelDetails = () => {
  const { id: channelId } = useParams();
  const [showDescription, setShowDescription] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  // Check subscription status
  const checkSubscription = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: subscription } = await supabase
      .from("channel_subscriptions")
      .select("*")
      .eq("channel_id", channelId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    setIsSubscribed(!!subscription);
  };

  useEffect(() => {
    checkSubscription();
  }, [channelId]);

  const handleSubscribe = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to subscribe to channels");
      return;
    }

    try {
      if (isSubscribed) {
        const { error } = await supabase
          .from("channel_subscriptions")
          .delete()
          .eq("channel_id", channelId)
          .eq("user_id", session.user.id);

        if (error) throw error;
        setIsSubscribed(false);
        toast.success("Unsubscribed from channel");
      } else {
        const { error } = await supabase
          .from("channel_subscriptions")
          .insert({
            channel_id: channelId,
            user_id: session.user.id
          });

        if (error) throw error;
        setIsSubscribed(true);
        toast.success("Subscribed to channel");
      }
    } catch (error) {
      console.error("Error managing subscription:", error);
      toast.error("Failed to update subscription");
    }
  };

  // Fetch channel details with improved error handling
  const { data: channel, isLoading: isLoadingChannel } = useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      if (!channelId) {
        throw new Error("Channel ID is required");
      }

      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("channel_id", channelId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching channel:", error);
        toast.error("Failed to load channel details");
        throw error;
      }

      if (!data) {
        toast.error("Channel not found");
        throw new Error("Channel not found");
      }

      return data;
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Fetch videos with improved reliability and refetching
  const { data: videos, isLoading: isLoadingVideos, refetch: refetchVideos } = useQuery({
    queryKey: ["channel-videos", channelId],
    queryFn: async () => {
      if (!channelId) {
        throw new Error("Channel ID is required");
      }

      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("channel_id", channelId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        toast.error("Failed to load videos");
        throw error;
      }

      // If no videos found, trigger a fetch and retry
      if (!data || data.length === 0) {
        if (!isRefetching) {
          setIsRefetching(true);
          try {
            const response = await fetch(`https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/fetch-youtube-videos`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ channels: [channelId] })
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch videos');
            }

            // Wait a moment for the videos to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Retry fetching videos after the fetch function has run
            const { data: refetchedData, error: refetchError } = await supabase
              .from("youtube_videos")
              .select("*")
              .eq("channel_id", channelId)
              .order("uploaded_at", { ascending: false });

            if (refetchError) throw refetchError;
            setIsRefetching(false);
            return refetchedData || [];
          } catch (fetchError) {
            console.error("Error fetching videos:", fetchError);
            toast.error("Failed to load videos");
            setIsRefetching(false);
            return [];
          }
        }
      }

      return data || [];
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    enabled: !!channelId && !!channel,
  });

  useEffect(() => {
    if (videos && videos.length === 0 && !isLoadingVideos && !isRefetching) {
      toast.loading("Fetching channel videos...");
      refetchVideos();
    }
  }, [videos, isLoadingVideos, isRefetching]);

  if (isLoadingChannel || isLoadingVideos) {
    return (
      <div className="container mx-auto p-4 mt-16">
        <BackButton />
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="container mx-auto p-4 mt-16">
        <BackButton />
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-lg text-destructive">Channel not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-16 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]">
      <BackButton />
      <div className="flex flex-col items-center mb-8">
        <Avatar className="w-32 h-32 mb-4 opacity-0 animate-[scaleIn_0.6s_ease-out_0.3s_forwards] group">
          <AvatarImage
            src={channel.thumbnail_url}
            alt={channel.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <AvatarFallback className="bg-primary/10">
            <Youtube className="w-16 h-16 text-primary" />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold text-center mb-2 opacity-0 animate-[fadeIn_0.6s_ease-out_0.4s_forwards]">
          {channel.title}
        </h1>
        
        <Button
          variant={isSubscribed ? "default" : "outline"}
          onClick={handleSubscribe}
          className={`mb-4 transition-all duration-200 ${
            isSubscribed ? "bg-primary hover:bg-primary-hover text-white shadow-md" : ""
          }`}
        >
          {isSubscribed ? (
            <>
              <Check className="w-4 h-4 mr-2 animate-in" />
              Subscribed
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Subscribe
            </>
          )}
        </Button>

        {channel.description && (
          <div className="flex flex-col items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors border-muted-foreground/30 h-7 px-2"
            >
              {showDescription ? (
                <span className="flex items-center gap-1">
                  Less <ChevronUp className="h-3 w-3" />
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  More <ChevronDown className="h-3 w-3" />
                </span>
              )}
            </Button>
            {showDescription && (
              <p className="text-muted-foreground text-sm text-center max-w-2xl mt-2 animate-fade-in">
                {channel.description}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {videos?.map((video, index) => (
          <div 
            key={video.id} 
            className="opacity-0"
            style={{ 
              animation: `fadeIn 0.6s ease-out ${0.5 + index * 0.1}s forwards`
            }}
          >
            <VideoCard
              id={video.video_id}
              uuid={video.id}
              title={video.title}
              thumbnail={video.thumbnail}
              channelName={video.channel_name}
              views={video.views || 0}
              uploadedAt={video.uploaded_at}
              channelId={video.channel_id}
              channelThumbnail={channel.thumbnail_url}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelDetails;