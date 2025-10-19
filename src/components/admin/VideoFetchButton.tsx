import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VideoFetchButtonProps {
  onFetchComplete?: () => void;
}

export const VideoFetchButton: React.FC<VideoFetchButtonProps> = ({ onFetchComplete }) => {
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchVideos = async () => {
    setIsFetching(true);
    
    try {
      toast.loading('Fetching all active channels...');
      
      // Get all active channel IDs
      const { data: channels, error: channelError } = await supabase
        .from('youtube_channels')
        .select('channel_id')
        .is('deleted_at', null)
        .is('fetch_error', null);
      
      if (channelError) {
        throw new Error(`Failed to get channels: ${channelError.message}`);
      }

      if (!channels || channels.length === 0) {
        toast.dismiss();
        toast.warning('No active channels found. Add some YouTube channels first.');
        return;
      }

      const channelIds = channels.map(c => c.channel_id);
      console.log(`Starting fetch for ${channelIds.length} channels`);

      // Process channels in batches of 50 to avoid timeouts
      const BATCH_SIZE = 50;
      const batches = [];
      for (let i = 0; i < channelIds.length; i += BATCH_SIZE) {
        batches.push(channelIds.slice(i, i + BATCH_SIZE));
      }

      console.log(`Processing ${channelIds.length} channels in ${batches.length} batches`);
      
      let totalProcessed = 0;
      let totalNewVideos = 0;
      let batchNum = 0;

      // Process each batch sequentially
      for (const batch of batches) {
        batchNum++;
        toast.loading(`Processing batch ${batchNum}/${batches.length} (${batch.length} channels)...`);
        
        try {
          const { data: result, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
            body: {
              channels: batch,
              forceUpdate: true,
              quotaConservative: false,
              prioritizeRecent: false,
              maxChannelsPerRun: batch.length,
              bypassQuotaCheck: true
            }
          });

          if (fetchError) {
            console.error(`Error in batch ${batchNum}:`, fetchError);
            toast.error(`Batch ${batchNum} failed: ${fetchError.message}. Continuing...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }

          if (result?.success) {
            totalProcessed += result.processed || 0;
            totalNewVideos += result.newVideos || 0;
            console.log(`Batch ${batchNum} complete: ${result.processed} channels, ${result.newVideos} new videos`);
          }
        } catch (batchError) {
          console.error(`Batch ${batchNum} error:`, batchError);
          toast.error(`Batch ${batchNum} failed. Continuing with next batch...`);
        }

        // Small delay between batches
        if (batchNum < batches.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.dismiss();

      if (totalNewVideos > 0) {
        toast.success(
          `Successfully fetched and AI-filtered ${totalNewVideos} new videos from ${totalProcessed} channels!`
        );
      } else {
        toast.info(
          `Processed ${totalProcessed} channels - no new videos found. All channels are up to date.`
        );
      }
      
      if (onFetchComplete) {
        onFetchComplete();
      }

    } catch (error) {
      console.error('Video fetch error:', error);
      toast.dismiss();
      toast.error(`Failed to fetch videos: ${error.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Button
      onClick={handleFetchVideos}
      disabled={isFetching}
      className="flex items-center gap-2"
    >
      {isFetching ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isFetching ? 'Fetching & Filtering...' : 'Fetch YouTube Videos'}
    </Button>
  );
};