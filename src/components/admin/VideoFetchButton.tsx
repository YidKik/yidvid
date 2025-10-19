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

      toast.loading(`Processing ${channelIds.length} channels with AI filtering...`);

      // Call the fetch-youtube-videos edge function with ALL channels
      const { data: result, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: {
          channels: channelIds,
          forceUpdate: true,
          quotaConservative: false,
          prioritizeRecent: false,
          maxChannelsPerRun: channelIds.length, // Process ALL channels
          bypassQuotaCheck: true // Admin operation - bypass quota limits
        }
      });

      toast.dismiss();

      if (fetchError) {
        throw new Error(`Fetch failed: ${fetchError.message}`);
      }

      if (result?.success) {
        const processed = result.processed || 0;
        const newVideos = result.newVideos || 0;
        
        if (newVideos > 0) {
          toast.success(
            `Successfully fetched and AI-filtered ${newVideos} new videos from ${processed} channels!`
          );
        } else {
          toast.info(
            `Processed ${processed} channels - no new videos found. All channels are up to date.`
          );
        }
        
        if (onFetchComplete) {
          onFetchComplete();
        }
      } else {
        throw new Error(result?.message || 'Fetch operation failed');
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