
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const getChannelsFromDatabase = async (supabaseClient: SupabaseClient) => {
  console.log('[YouTube Videos] Fetching channels from database');
  const { data: channelsData, error: channelsError } = await supabaseClient
    .from('youtube_channels')
    .select('channel_id');

  if (channelsError) {
    console.error('[YouTube Videos] Error fetching channels:', channelsError);
    throw channelsError;
  }

  console.log(`[YouTube Videos] Found ${channelsData.length} channels`);
  return channelsData.map(channel => channel.channel_id);
};

export const storeVideosInDatabase = async (
  supabaseClient: SupabaseClient, 
  videos: any[]
) => {
  console.log(`[YouTube Videos] Starting to store ${videos.length} videos`);
  const batchSize = 50; // Reduced batch size for better reliability
  const results = [];

  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize);
    console.log(`[YouTube Videos] Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(videos.length / batchSize)}`);
    
    try {
      const { data, error } = await supabaseClient
        .from('youtube_videos')
        .upsert(batch, { 
          onConflict: 'video_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`[YouTube Videos] Error upserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        continue; // Continue with next batch even if this one fails
      }

      if (data) {
        results.push(...data);
      }
    } catch (error) {
      console.error(`[YouTube Videos] Unexpected error in batch ${Math.floor(i / batchSize) + 1}:`, error);
    }

    // Add a small delay between batches to prevent overwhelming the database
    if (i + batchSize < videos.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`[YouTube Videos] Successfully stored ${results.length} videos`);
  return results;
};
