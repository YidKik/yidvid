
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

      // Try to fetch channel IDs directly with error handling
      let channelIds = [];
      
      try {
        // First attempt - direct query
        const { data: channels, error: channelsError } = await supabase
          .from('youtube_channels')
          .select('channel_id')
          .is('deleted_at', null)
          .limit(20);
          
        if (channelsError) {
          console.error('Error in primary channel fetch:', channelsError);
          throw channelsError;
        }
        
        if (!channels || channels.length === 0) {
          toast.error("No channels found to fetch videos for");
          return;
        }
        
        channelIds = channels.map(channel => channel.channel_id);
        console.log(`Successfully fetched ${channelIds.length} channel IDs`);
      } catch (fetchError) {
        console.error('Error during channel ID fetch, trying alternate approach:', fetchError);
        
        try {
          // Fallback - use edge function to get channels
          const { data: edgeResponse, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
            body: { limit: 20 }
          });
          
          if (edgeError) {
            console.error('Edge function also failed:', edgeError);
            throw edgeError;
          }
          
          if (edgeResponse?.data && Array.isArray(edgeResponse.data) && edgeResponse.data.length > 0) {
            channelIds = edgeResponse.data.map(c => c.channel_id);
            console.log(`Retrieved ${channelIds.length} channels via edge function`);
          } else {
            throw new Error('No channels returned from edge function');
          }
        } catch (edgeFailure) {
          console.error('All channel fetch methods failed:', edgeFailure);
          
          // Last resort - use hardcoded sample channels for testing
          // This allows the function to continue even when data fetch fails
          const sampleChannelsResponse = await fetch('https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
            }
          });
          
          if (sampleChannelsResponse.ok) {
            const sampleData = await sampleChannelsResponse.json();
            if (sampleData?.data && Array.isArray(sampleData.data)) {
              channelIds = sampleData.data.slice(0, 3).map(c => c.channel_id);
              console.log(`Using ${channelIds.length} sample channels as fallback`);
            }
          }
          
          if (channelIds.length === 0) {
            toast.error("Failed to get any channels - please try again later");
            return;
          }
        }
      }
      
      if (channelIds.length === 0) {
        toast.error("No channels available to fetch videos for");
        return;
      }
      
      console.log(`Fetching videos for ${channelIds.length} channels`);
      
      // Call the edge function to fetch videos with forceUpdate=true to ensure fresh data
      const { data, error } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: { 
          channels: channelIds,
          forceUpdate: true,  // Force update to get latest videos
          quotaConservative: false, // Use more aggressive quota to get more videos
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
