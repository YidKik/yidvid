
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

  // Optimized function to fetch videos with smart batching and minimal edge function calls
  const handleFetchVideos = async () => {
    try {
      setIsLoading(true);
      setProcessingStatus("Fetching active channels...");
      toast.loading("Fetching active channels...");
      
      // Step 1: Get all active channel IDs
      const channelIds = await fetchAllChannelIds();
      
      if (!channelIds || channelIds.length === 0) {
        toast.error("No channels found to fetch videos for");
        setIsLoading(false);
        setProcessingStatus(null);
        return;
      }
      
      console.log(`Found ${channelIds.length} channels to process`);
      
      // OPTIMIZED: Process channels in smart batches to reduce edge function calls
      const BATCH_SIZE = 25; // Process 25 channels per edge function call
      const batches = [];
      for (let i = 0; i < channelIds.length; i += BATCH_SIZE) {
        batches.push(channelIds.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`Will process ${batches.length} batches of ~${BATCH_SIZE} channels each`);
      
      let totalProcessed = 0;
      let totalNewVideos = 0;
      let successfulBatches = 0;
      
      // Process batches with delays to avoid overwhelming the system
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchNumber = batchIndex + 1;
        
        setProcessingStatus(`Processing batch ${batchNumber}/${batches.length} (${batch.length} channels)...`);
        toast.loading(`Processing batch ${batchNumber}/${batches.length} (${batch.length} channels)...`);
        
        try {
          // SINGLE edge function call per batch
          const { data: batchData, error: batchError } = await supabase.functions.invoke('fetch-youtube-videos', {
            body: { 
              channels: batch,
              forceUpdate: true,
              maxChannelsPerRun: batch.length,
              bypassQuotaCheck: true
            }
          });
          
          if (!batchError && batchData?.success) {
            totalProcessed += batchData.processed || 0;
            totalNewVideos += batchData.newVideos || 0;
            successfulBatches++;
            
            console.log(`Batch ${batchNumber} completed: ${batchData.processed} channels, ${batchData.newVideos} new videos`);
          } else {
            console.warn(`Batch ${batchNumber} failed:`, batchError || batchData);
          }
          
          // Add delay between batches to prevent overwhelming
          if (batchIndex < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
          }
          
        } catch (batchError) {
          console.error(`Error processing batch ${batchNumber}:`, batchError);
        }
      }
      
      // Show final results
      toast.dismiss();
      
      if (successfulBatches > 0) {
        if (totalNewVideos > 0) {
          toast.success(`Successfully processed ${totalProcessed} channels across ${successfulBatches} batches and found ${totalNewVideos} new videos`, {
            description: `Completed ${successfulBatches}/${batches.length} batches successfully`
          });
        } else {
          toast.info(`Processed ${totalProcessed} channels across ${successfulBatches} batches but no new videos were found`, {
            description: "All channels are up to date"
          });
        }
      } else {
        toast.error("No batches processed successfully", {
          description: "Check your connection and try again"
        });
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

  // Helper function to fetch all channel IDs with smart batching
  const fetchAllChannelIds = async (): Promise<string[]> => {
    try {
      // ONLY use direct database query to avoid excessive function calls
      const { data: channels, error: channelsError } = await supabase
        .from('youtube_channels')
        .select('channel_id, last_fetch')
        .is('deleted_at', null)
        .order('last_fetch', { ascending: true, nullsFirst: true }) // Prioritize channels never fetched
        .limit(100); // Increased limit for better coverage
        
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
              This will connect to YouTube and fetch the latest videos for ALL channels using an optimized approach.
              The process will:
              <ul className="list-disc pl-5 mt-2">
                <li>Process up to 100 channels prioritizing least recently fetched</li>
                <li>Use smart batching (25 channels per edge function call)</li>
                <li>Minimize edge function usage with delays between batches</li>
                <li>Use backup API key if quota is exceeded</li>
              </ul>
              <div className="mt-2 text-green-600 font-medium">
                ✅ Optimized to minimize Supabase edge function usage and costs
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
