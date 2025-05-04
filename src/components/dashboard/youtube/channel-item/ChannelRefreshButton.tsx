
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
      toast.loading(`Fetching videos for ${channelTitle || channelId}...`);

      // Invoke the edge function to fetch videos for this specific channel
      const { data, error } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: { 
          channels: [channelId],
          forceUpdate: true,
          bypassQuotaCheck: true
        }
      });

      if (error) {
        console.error("Error fetching videos:", error);
        toast.error(`Failed to fetch videos: ${error.message}`);
        return;
      }

      toast.dismiss();
      
      if (data?.success) {
        if (data.newVideos > 0) {
          toast.success(`Found ${data.newVideos} new videos for ${channelTitle || channelId}`, {
            description: `Used ${data.usedFallbackKey ? "fallback" : "primary"} API key`
          });
        } else {
          toast.info(`No new videos found for ${channelTitle || channelId}`, {
            description: "Channel content is up to date"
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
      toast.dismiss();
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
