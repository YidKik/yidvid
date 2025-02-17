
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
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to perform this action");
        return;
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!userProfile?.is_admin) {
        toast.error("You don't have permission to perform this action");
        return;
      }

      const { data, error } = await supabase.functions.invoke('fetch-channel-videos');

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error("Failed to fetch videos. Please try again later.");
        return;
      }

      if (data.success) {
        const successCount = data.results.filter((r: any) => r.success).length;
        toast.success(`Successfully processed ${successCount} channels`);
        
        // Show errors if any
        const errors = data.results.filter((r: any) => !r.success);
        if (errors.length > 0) {
          console.error('Errors during processing:', errors);
          toast.error(`Failed to process ${errors.length} channels. Check console for details.`);
        }
      } else {
        toast.error(data.message || "Failed to fetch videos");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
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
