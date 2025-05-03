
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

  // Main function to fetch videos from YouTube and update the database
  const handleFetchVideos = async () => {
    try {
      setIsLoading(true);
      toast.loading("Fetching channels...");
      
      // Step 1: Get all active channel IDs
      const channelIds = await fetchChannelIds();
      
      if (!channelIds || channelIds.length === 0) {
        toast.error("No channels found to fetch videos for");
        setIsLoading(false);
        return;
      }
      
      console.log(`Successfully retrieved ${channelIds.length} channels`);
      toast.loading(`Processing ${channelIds.length} channels from YouTube...`);
      
      // Step 2 & 3: Call edge function to fetch videos from YouTube and save to database
      const { data, error } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: { 
          channels: channelIds,
          forceUpdate: true,  // Always force update to get fresh videos
          quotaConservative: false, // Use aggressive quota to get more videos
          maxChannelsPerRun: 20
        }
      });

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error(`Error fetching videos: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error("No response received from video fetch service");
        return;
      }

      // Display results
      if (data.success) {
        if (data.processed > 0) {
          if (data.newVideos > 0) {
            toast.success(`Successfully processed ${data.processed} channels and found ${data.newVideos} new videos`);
          } else {
            toast.info(`Processed ${data.processed} channels but no new videos were found`);
          }
        } else {
          toast.warning(`No channels were processed. This might be due to YouTube API restrictions or quota limits.`);
        }
        
        // Show detailed results for debugging
        console.log("Channel processing results:", data.results);
        
        // Show quota information
        if (data.quotaRemaining !== undefined) {
          console.log(`YouTube API quota remaining: ${data.quotaRemaining}`);
        }
      } else {
        toast.error(`Failed to fetch videos: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in handleFetchVideos:', error);
      toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      toast.dismiss();
    }
  };

  // Helper function to fetch channel IDs using multiple methods for reliability
  const fetchChannelIds = async (): Promise<string[]> => {
    try {
      // Try multiple approaches to get channel IDs, starting with direct database query
      let channelIds: string[] = [];
      
      // Method 1: Direct database query
      try {
        const { data: channels, error: channelsError } = await supabase
          .from('youtube_channels')
          .select('channel_id')
          .is('deleted_at', null)
          .limit(20);
          
        if (!channelsError && channels && channels.length > 0) {
          console.log(`Successfully fetched ${channels.length} channel IDs directly from database`);
          return channels.map(channel => channel.channel_id);
        } else if (channelsError) {
          console.warn("Direct channel fetch failed, trying alternative methods:", channelsError);
        } else {
          console.warn("Direct channel fetch returned no channels, trying alternative methods");
        }
      } catch (directQueryError) {
        console.error('Error in direct channel query:', directQueryError);
      }
      
      // Method 2: Use edge function
      try {
        const { data: edgeResponse, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
          body: { limit: 20 }
        });
        
        if (!edgeError && edgeResponse?.data && Array.isArray(edgeResponse.data) && edgeResponse.data.length > 0) {
          console.log(`Retrieved ${edgeResponse.data.length} channels via edge function`);
          return edgeResponse.data.map(c => c.channel_id);
        } else {
          console.warn("Edge function channel fetch failed", edgeError);
        }
      } catch (edgeError) {
        console.error('Edge function error:', edgeError);
      }
      
      // Method 3: Use public endpoint as last resort
      try {
        const response = await fetch('https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/get-public-channels', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
            console.log(`Retrieved ${result.data.length} channels via public endpoint`);
            return result.data.map(c => c.channel_id);
          }
        }
      } catch (fetchError) {
        console.error('Public endpoint error:', fetchError);
      }
      
      // If all methods fail
      toast.error("Failed to get channel list. Please try again later.");
      throw new Error("Could not retrieve channel list using any available method");
    } catch (error) {
      console.error("Error fetching channel IDs:", error);
      throw error;
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
            <AlertDialogTitle>Fetch YouTube Videos</AlertDialogTitle>
            <AlertDialogDescription>
              This will connect to YouTube and fetch the latest videos for all channels.
              The process may take some time and uses YouTube API quota.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFetchVideos}>Fetch Videos</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
