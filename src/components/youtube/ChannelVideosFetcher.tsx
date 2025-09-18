
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionManager } from "@/hooks/useSessionManager";
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
  const { session, isAuthenticated } = useSessionManager();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.id) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
        
      setIsAdmin(profile?.is_admin || false);
    };
    
    checkAdminStatus();
  }, [session]);

  // Optimized function to fetch videos with smart batching and minimal edge function calls
  const handleFetchVideos = async () => {
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as an admin to fetch videos");
      return;
    }

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
      
      console.log(`Found ${channelIds.length} channels to process:`, channelIds.slice(0, 5));
      
      // Process all channels in a single edge function call (no client-side batching)
      setProcessingStatus(`Processing ${channelIds.length} channels...`);
      toast.loading(`Fetching latest videos for ${channelIds.length} channels...`);

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          throw new Error("Authentication session expired. Please log in again.");
        }

        const { data: result, error: invokeError } = await supabase.functions.invoke('fetch-youtube-videos', {
          body: JSON.stringify({
            channels: channelIds,
            forceUpdate: true,
            // Process all provided channels in this run; server still respects YouTube quota
            maxChannelsPerRun: channelIds.length,
            bypassQuotaCheck: true,
            prioritizeRecent: false
          }),
          headers: {
            'Authorization': `Bearer ${currentSession.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Fetch all channels response:', { result, invokeError });

        toast.dismiss();

        if (invokeError) {
          console.error('Edge function error:', invokeError);
          toast.error(`Failed: ${invokeError.message || 'Unknown error'}`);
        } else if (result?.success) {
          const processed = result.processed || 0;
          const newVideos = result.newVideos || 0;
          if (newVideos > 0) {
            toast.success(`Fetched ${newVideos} new videos from ${processed} channels`);
          } else {
            toast.info(`Processed ${processed} channels — no new videos found`);
          }
        } else {
          toast.error(result?.message || 'Fetch did not succeed');
        }
      } catch (singleError) {
        console.error('Error invoking fetch-youtube-videos:', singleError);
        toast.error(singleError.message || 'Unknown error');
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
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as an admin to update view counts");
      return;
    }

    try {
      setIsUpdatingViews(true);
      setProcessingStatus("Updating video view counts...");
      toast.loading("Updating video view counts...");
      
      // Get current session for authentication
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        throw new Error("Authentication session expired. Please log in again.");
      }
      
      // Use Supabase client with proper body serialization
      const { data: result, error } = await supabase.functions.invoke('update-video-views', {
        body: JSON.stringify({
          batchSize: 50,
          maxVideos: 300,
          bypassQuotaCheck: true
        }),
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        toast.error(`Failed to update view counts: ${error.message}`);
      } else if (result && result.success) {
        toast.success(`Successfully updated ${result.updated} video view counts`, {
          description: `Updated ${result.updated} videos, ${result.failed} failed`
        });
      } else {
        toast.error(`Failed to update view counts: ${result?.message || 'Unknown error'}`);
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
      console.log("Fetching channel IDs from database...");
      
      // ONLY use direct database query to avoid excessive function calls
      const { data: channels, error: channelsError } = await supabase
        .from('youtube_channels')
        .select('channel_id, last_fetch, title')
        .is('deleted_at', null)
        .is('fetch_error', null)
        .order('last_fetch', { ascending: true, nullsFirst: true }) // Prioritize channels never fetched
        .limit(200); // Increased limit for better coverage
        
      if (channelsError) {
        console.error('Database error fetching channels:', channelsError);
        toast.error(`Database error: ${channelsError.message}`);
        throw channelsError;
      }
      
      if (!channels || channels.length === 0) {
        console.warn("No channels found in database");
        toast.error("No channels found in database to fetch videos for");
        return [];
      }
      
      console.log(`Successfully fetched ${channels.length} channel IDs from database:`, 
                  channels.slice(0, 3).map(c => c.title || c.channel_id));
      return channels.map(channel => channel.channel_id);
      
    } catch (error) {
      console.error("Error fetching channel IDs:", error);
      toast.error(`Failed to fetch channels: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={() => setShowConfirmDialog(true)}
          disabled={isLoading || isUpdatingViews || !isAuthenticated || !isAdmin}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {processingStatus || "Processing..."}
            </>
          ) : !isAuthenticated ? (
            "Login Required"
          ) : !isAdmin ? (
            "Admin Access Required"
          ) : (
            "Fetch Channel Videos"
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowViewsDialog(true)}
          disabled={isLoading || isUpdatingViews || !isAuthenticated || !isAdmin}
        >
          {isUpdatingViews ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating View Counts...
            </>
          ) : !isAuthenticated ? (
            "Login Required"
          ) : !isAdmin ? (
            "Admin Access Required"
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
              This will fetch the latest videos for ALL channels in one run (no client-side batching).
              The process will:
              <ul className="list-disc pl-5 mt-2">
                <li>Prioritize channels least recently fetched</li>
                <li>Use a fallback API key automatically if needed</li>
                <li>Respect YouTube API limits; this may take a few minutes</li>
              </ul>
              <div className="mt-2 text-green-600 font-medium">
                ✅ Single call for reliability; server handles sequencing and quotas
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
