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
      toast.info('Starting YouTube video fetch with AI filtering...');
      
      // Get all active channel IDs
      const { data: channels, error: channelError } = await supabase
        .from('youtube_channels')
        .select('channel_id')
        .is('deleted_at', null);
      
      if (channelError) {
        throw new Error(`Failed to get channels: ${channelError.message}`);
      }

      if (!channels || channels.length === 0) {
        toast.warning('No active channels found. Add some YouTube channels first.');
        return;
      }

      // Call the fetch-youtube-videos edge function
      const { data: result, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
        body: {
          channels: channels.map(c => c.channel_id),
          forceUpdate: false,
          quotaConservative: true,
          prioritizeRecent: true,
          maxChannelsPerRun: 20
        }
      });

      if (fetchError) {
        throw new Error(`Fetch failed: ${fetchError.message}`);
      }

      if (result.success) {
        toast.success(
          `Successfully processed ${result.processed || 0} channels. ` +
          `Found ${result.newVideos || 0} new videos. All videos were processed through AI filtering.`
        );
        
        if (onFetchComplete) {
          onFetchComplete();
        }
      } else {
        throw new Error(result.message || 'Fetch operation failed');
      }

    } catch (error) {
      console.error('Video fetch error:', error);
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
      {isFetching ? 'Fetching & Filtering...' : 'Fetch YouTube Videos (with AI Filtering)'}
    </Button>
  );
};