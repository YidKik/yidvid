
import { SupabaseClient } from '@supabase/supabase-js';

export const getChannelsFromDatabase = async (supabaseClient: SupabaseClient) => {
  const { data: channelsData, error: channelsError } = await supabaseClient
    .from('youtube_channels')
    .select('channel_id');

  if (channelsError) {
    console.error('[YouTube Videos] Error fetching channels:', channelsError);
    throw channelsError;
  }

  return channelsData.map(channel => channel.channel_id);
};

export const storeVideosInDatabase = async (
  supabaseClient: SupabaseClient, 
  videos: any[]
) => {
  const batchInsertSize = 100;
  for (let i = 0; i < videos.length; i += batchInsertSize) {
    const batch = videos.slice(i, i + batchInsertSize);
    const { error: upsertError } = await supabaseClient
      .from('youtube_videos')
      .upsert(batch, { 
        onConflict: 'video_id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error(`[YouTube Videos] Error upserting batch ${Math.floor(i / batchInsertSize) + 1}:`, upsertError);
    }
  }
};

