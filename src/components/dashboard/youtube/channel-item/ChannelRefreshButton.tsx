
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChannelRefreshButtonProps {
  channelId: string;
  channelTitle?: string;
}

export const ChannelRefreshButton = ({ channelId, channelTitle }: ChannelRefreshButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchChannelVideos = async () => {
    try {
      setIsLoading(true);
      const loadingToast = toast.loading(`Fetching videos for ${channelTitle || channelId}...`);

      // Ensure auth token for function (if required)
      const { data: { session } } = await supabase.auth.getSession();

      const payload = {
        channels: [channelId],
        forceUpdate: true,
        bypassQuotaCheck: true,
        prioritizeRecent: true,
        singleChannelMode: true
      };

      const { data, error } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: payload,
        headers: {
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      toast.dismiss(loadingToast);

      if (error) {
        console.error("Error fetching videos:", error);
        toast.error(`Failed to fetch videos: ${error.message}`);
        return;
      }
      
      console.log("Channel fetch response:", data);
      
      if (data?.success) {
        const channelResult = data.results?.find(r => r.channelId === channelId);
        
        if (channelResult?.newVideos > 0) {
          toast.success(`Found ${channelResult.newVideos} new videos for ${channelTitle || channelId}`, {
            description: `Used ${channelResult.usedFallbackKey ? "fallback" : "primary"} API key`
          });
        } else {
          toast.info(`No new videos found for ${channelTitle || channelId}`, {
            description: "Channel content is up to date or there was an issue with video processing"
          });
        }
      } else {
        toast.error(`Error fetching videos: ${data?.message || "Unknown error"}`);
      }

    } catch (error) {
      console.error("Error in handleFetchChannelVideos:", error);
      toast.error(`Error: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleFetchChannelVideos}
      disabled={isLoading}
      className="text-muted-foreground hover:text-primary"
      title={`Fetch videos for ${channelTitle || channelId}`}
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
    </Button>
  );
};
