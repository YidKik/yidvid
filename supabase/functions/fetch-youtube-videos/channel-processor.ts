
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchChannelVideos } from './youtube-api.ts';
import { storeVideosInDatabase } from './db-operations.ts';
import { updateQuota, setQuotaExceeded, QuotaData } from './quota-manager.ts';

export const logChannelUpdate = async (
  supabase: SupabaseClient,
  channelId: string,
  videosCount: number | null = 0,
  error: string | null = null
) => {
  await supabase
    .from('youtube_update_logs')
    .insert({
      channel_id: channelId,
      videos_count: videosCount,
      error
    })
    .single();
};

export const updateChannelStatus = async (
  supabase: SupabaseClient,
  channelId: string,
  now: Date,
  error: string | null = null
) => {
  await supabase
    .from('youtube_channels')
    .update({ 
      last_fetch: now.toISOString(),
      fetch_error: error
    })
    .eq('channel_id', channelId)
    .single();
};

export const processChannel = async (
  supabase: SupabaseClient,
  channelId: string,
  youtubeApiKey: string,
  quotaData: QuotaData,
  now: Date
) => {
  let nextPageToken: string | null = null;
  let allVideos = [];
  
  // Log the start of update
  await logChannelUpdate(supabase, channelId);

  do {
    const result = await fetchChannelVideos(channelId, youtubeApiKey, nextPageToken);
    
    if (result.quotaExceeded) {
      await setQuotaExceeded(supabase, now);
      return { quotaExceeded: true };
    }
    
    // Update quota after successful API call
    await updateQuota(supabase, quotaData.quota_remaining, now);
    
    allVideos = [...allVideos, ...result.videos];
    nextPageToken = result.nextPageToken;
  } while (nextPageToken);

  if (allVideos.length > 0) {
    const storedVideos = await storeVideosInDatabase(supabase, allVideos);
    
    // Update the videos count in youtube_update_logs
    await logChannelUpdate(supabase, channelId, allVideos.length);
    
    // Update channel's last_fetch timestamp
    await updateChannelStatus(supabase, channelId, now);
    
    return { videos: storedVideos, quotaExceeded: false };
  }

  return { videos: [], quotaExceeded: false };
};
