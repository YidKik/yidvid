
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export const ChannelVideosFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleFetchVideos = async () => {
    try {
      setIsLoading(true);
      toast.loading("Fetching videos from YouTube...");
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to perform this action");
        return;
      }

      // Get all active channels to fetch videos for
      const { data: channels, error: channelsError } = await supabase
        .from('youtube_channels')
        .select('channel_id')
        .is('deleted_at', null)
        .limit(20); // Limit to prevent API quota issues
        
      if (channelsError) {
        console.error('Error fetching channels:', channelsError);
        toast.error("Failed to fetch channels");
        return;
      }
      
      if (!channels || channels.length === 0) {
        toast.error("No channels found to fetch videos for");
        return;
      }
      
      console.log(`Fetching videos for ${channels.length} channels`);

      // Extract channel IDs
      const channelIds = channels.map(channel => channel.channel_id);
      
      // Call the edge function to fetch videos
      const { data, error } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: { 
          channels: channelIds,
          forceUpdate: true,
          quotaConservative: false,
          maxChannelsPerRun: 20
        }
      });

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error(`Failed to fetch videos: ${error.message}`);
        return;
      }

      console.log('Fetch response:', data);

      if (data.success) {
        toast.success(`Successfully processed ${data.processed || 0} channels and found ${data.newVideos || 0} new videos`);
      } else {
        toast.error(`Failed to fetch videos: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Error fetching videos: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      toast.dismiss();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowConfirmDialog(true)}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Fetch Channel Videos"}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fetch Channel Videos</AlertDialogTitle>
            <AlertDialogDescription>
              This will fetch videos for channels that haven't been updated in the last 7 days.
              The process will respect YouTube API quotas and may take some time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFetchVideos}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
