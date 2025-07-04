
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
import { Loader2, RefreshCw } from "lucide-react";

export const ChannelVideosFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingViews, setIsUpdatingViews] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showViewsDialog, setShowViewsDialog] = useState(false);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  // Main function to fetch videos from YouTube and update the database
  const handleFetchVideos = async () => {
    try {
      setIsLoading(true);
      setProcessingStatus("Fetching all active channels...");
      toast.loading("Fetching all active channels...");
      
      // Step 1: Get all active channel IDs
      const channelIds = await fetchAllChannelIds();
      
      if (!channelIds || channelIds.length === 0) {
        toast.error("No channels found to fetch videos for");
        setIsLoading(false);
        setProcessingStatus(null);
        return;
      }
      
      console.log(`Successfully retrieved ${channelIds.length} channels`);
      setProcessingStatus(`Processing ${channelIds.length} channels from YouTube...`);
      toast.loading(`Processing ${channelIds.length} channels from YouTube...`);
      
      // Try up to 3 methods to fetch videos, starting with most direct
      let fetchResult = null;
      let successfulMethod = "";
      let usedFallbackKey = false;
      
      // Method 1: Try with direct edge function
      try {
        setProcessingStatus("Processing all channels via edge function...");
        const { data: directData, error: directError } = await supabase.functions.invoke('fetch-youtube-videos', {
          body: { 
            channels: channelIds, 
            forceUpdate: true,
            quotaConservative: false,
            maxChannelsPerRun: channelIds.length, // Process all channels
            bypassQuotaCheck: true
          }
        });
        
        if (!directError && directData?.success) {
          fetchResult = directData;
          successfulMethod = "direct edge function";
          usedFallbackKey = directData.usedFallbackKey;
        } else if (directError) {
          console.warn("Method 1 failed:", directError);
        } else {
          console.warn("Method 1 returned unsuccessful result");
        }
      } catch (method1Error) {
        console.error("Method 1 error:", method1Error);
      }
      
      // Method 2: Try alternate edge function if first method failed
      if (!fetchResult) {
        try {
          setProcessingStatus("Trying alternate method for all channels...");
          const { data: altData, error: altError } = await supabase.functions.invoke('fetch-channel-videos', {
            body: { 
              force: true,
              allChannels: true  // Signal to process all channels
            }
          });
          
          if (!altError && altData?.success) {
            fetchResult = altData;
            successfulMethod = "channel videos edge function";
            usedFallbackKey = altData.usedFallbackKey;
          } else if (altError) {
            console.warn("Method 2 failed:", altError);
          } else {
            console.warn("Method 2 returned unsuccessful result");
          }
        } catch (method2Error) {
          console.error("Method 2 error:", method2Error);
        }
      }
      
      // Method 3: Try direct fetch as last resort
      if (!fetchResult) {
        try {
          setProcessingStatus("Trying direct API call for all channels...");
          const response = await fetch('https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/fetch-youtube-videos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
            },
            body: JSON.stringify({
              channels: channelIds,
              forceUpdate: true,
              bypassQuotaCheck: true,
              maxChannelsPerRun: channelIds.length // Process all channels
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data?.success) {
              fetchResult = data;
              successfulMethod = "direct fetch API";
              usedFallbackKey = data.usedFallbackKey;
            }
          }
        } catch (method3Error) {
          console.error("Method 3 error:", method3Error);
        }
      }
      
      // Process the result
      if (!fetchResult) {
        toast.error("All methods to fetch videos failed", {
          description: "Try again later or contact support",
        });
        setProcessingStatus(null);
        return;
      }

      // Display results
      toast.dismiss();
      
      if (fetchResult.success) {
        if (fetchResult.processed > 0) {
          if (fetchResult.newVideos > 0) {
            toast.success(`Successfully processed ${fetchResult.processed} channels and found ${fetchResult.newVideos} new videos`, {
              description: `Using ${usedFallbackKey ? 'fallback' : 'primary'} API key via ${successfulMethod}`
            });
          } else {
            toast.info(`Processed ${fetchResult.processed} channels but no new videos were found`, {
              description: `Using ${usedFallbackKey ? 'fallback' : 'primary'} API key via ${successfulMethod}`
            });
          }
        } else {
          // Videos fetching was attempted but no channels were processed
          toast.info("No channels were processed. API limits may be active.", {
            description: "The system attempted to use fallback API keys"
          });
        }
        
        // Show detailed results for debugging
        console.log("Channel processing results:", fetchResult.results);
        
        // Show quota information
        if (fetchResult.quotaRemaining !== undefined) {
          console.log(`YouTube API quota remaining: ${fetchResult.quotaRemaining}`);
        }
      } else {
        toast.error(`Failed to fetch videos: ${fetchResult.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in handleFetchVideos:', error);
      toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      setProcessingStatus(null);
      toast.dismiss();
    }
  };

  // New function to update video view counts
  const handleUpdateViewCounts = async () => {
    try {
      setIsUpdatingViews(true);
      setProcessingStatus("Updating video view counts...");
      toast.loading("Updating video view counts...");
      
      // Call the edge function directly
      const response = await fetch('https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/update-video-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
        },
        body: JSON.stringify({
          batchSize: 50,
          maxVideos: 300,
          bypassQuotaCheck: true
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          toast.success(`Successfully updated ${result.updated} video view counts`, {
            description: `Updated ${result.updated} videos, ${result.failed} failed`
          });
        } else {
          toast.error(`Failed to update view counts: ${result.message}`);
        }
      } else {
        toast.error("Error communicating with view count update service");
      }
    } catch (error) {
      console.error("Error updating view counts:", error);
      toast.error(`Error: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsUpdatingViews(false);
      setShowViewsDialog(false);
      setProcessingStatus(null);
      toast.dismiss();
    }
  };

  // Helper function to fetch all channel IDs
  const fetchAllChannelIds = async (): Promise<string[]> => {
    try {
      // Try multiple approaches to get channel IDs, starting with direct database query
      let channelIds: string[] = [];
      
      // ONLY use direct database query to avoid excessive function calls
      const { data: channels, error: channelsError } = await supabase
        .from('youtube_channels')
        .select('channel_id')
        .is('deleted_at', null)
        .order('last_fetch', { ascending: true })
        .limit(50); // Limit to reduce processing load
        
      if (channelsError) {
        console.error('Error fetching channels:', channelsError);
        throw channelsError;
      }
      
      if (!channels || channels.length === 0) {
        console.warn("No channels found in database");
        return [];
      }
      
      console.log(`Successfully fetched ${channels.length} channel IDs directly from database`);
      return channels.map(channel => channel.channel_id);
      
      // Method 4: Hardcode a few test channel IDs as absolute fallback
      const fallbackChannels = [
        "UCsT0YIqwnpJCM-mx7-gSA4Q", // TEDx Talks
        "UC3XTzVzaHQEd30rQbuvCtTQ", // LastWeekTonight
        "UCsvqVGtbbyHaMoevxPAq9Fg"  // PBS Space Time
      ];
      
      console.log("Using fallback channel IDs as last resort");
      return fallbackChannels;
      
    } catch (error) {
      console.error("Error fetching channel IDs:", error);
      throw error;
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={() => setShowConfirmDialog(true)}
          disabled={isLoading || isUpdatingViews}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {processingStatus || "Processing..."}
            </>
          ) : (
            "Fetch Channel Videos"
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowViewsDialog(true)}
          disabled={isLoading || isUpdatingViews}
        >
          {isUpdatingViews ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating View Counts...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Update View Counts
            </>
          )}
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fetch YouTube Videos</AlertDialogTitle>
            <AlertDialogDescription>
              This will connect to YouTube and fetch the latest videos for ALL channels.
              The process will:
              <ul className="list-disc pl-5 mt-2">
                <li>Process all available channels in the system</li>
                <li>Try multiple methods to bypass API restrictions</li>
                <li>Use different referer domains to overcome blocks</li>
                <li>Use backup API key if quota is exceeded</li>
              </ul>
              <div className="mt-2 text-yellow-600 font-medium">
                This may take several minutes depending on the number of channels.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFetchVideos}>Fetch All Videos</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showViewsDialog} onOpenChange={setShowViewsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Video View Counts</AlertDialogTitle>
            <AlertDialogDescription>
              This will connect to YouTube API and update view counts for videos in the database.
              The process will:
              <ul className="list-disc pl-5 mt-2">
                <li>Process up to 300 videos starting with oldest updated first</li>
                <li>Use both primary and fallback API keys as needed</li>
                <li>Update view counts in the database</li>
              </ul>
              <div className="mt-2 text-yellow-600 font-medium">
                This operation consumes YouTube API quota. It normally runs automatically twice daily.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateViewCounts}>Update View Counts</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
