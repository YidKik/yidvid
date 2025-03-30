

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const getChannelsFromDatabase = async (supabaseClient: SupabaseClient) => {
  console.log('[YouTube Videos] Fetching channels from database');
  
  try {
    const { data: channelsData, error: channelsError } = await supabaseClient
      .from('youtube_channels')
      .select('channel_id, title')
      .is('deleted_at', null)
      .is('fetch_error', null); // Only fetch channels without errors

    if (channelsError) {
      console.error('[YouTube Videos] Error fetching channels:', channelsError);
      throw channelsError;
    }

    if (!channelsData || channelsData.length === 0) {
      console.log('[YouTube Videos] No channels found in database');
      return [];
    }

    console.log(`[YouTube Videos] Found ${channelsData.length} channels:`, 
      channelsData.map(c => `${c.title} (${c.channel_id})`).join(', '));
    
    return channelsData.map(channel => channel.channel_id);
  } catch (error) {
    console.error('[YouTube Videos] Database error:', error);
    throw new Error('Failed to fetch channels from database');
  }
};

export const storeVideosInDatabase = async (
  supabaseClient: SupabaseClient, 
  videos: any[]
) => {
  if (!videos || videos.length === 0) {
    console.log('[YouTube Videos] No videos to store');
    return [];
  }

  console.log(`[YouTube Videos] Starting to store ${videos.length} videos`);
  const batchSize = 50;
  const results = [];

  try {
    // Log some sample videos for debugging
    console.log('[YouTube Videos] Sample video data:', videos.slice(0, 2));

    for (let i = 0; i < videos.length; i += batchSize) {
      const batch = videos.slice(i, i + batchSize);
      console.log(`[YouTube Videos] Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(videos.length / batchSize)}`);
      
      try {
        const { data, error } = await supabaseClient
          .from('youtube_videos')
          .upsert(batch, { 
            onConflict: 'video_id',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          console.error(`[YouTube Videos] Error upserting batch ${Math.floor(i / batchSize) + 1}:`, error);
          continue; // Continue with next batch even if this one fails
        }

        if (data) {
          results.push(...data);
          console.log(`[YouTube Videos] Successfully stored batch ${Math.floor(i / batchSize) + 1}`);
        }
      } catch (error) {
        console.error(`[YouTube Videos] Batch error:`, error);
      }

      // Add a small delay between batches
      if (i + batchSize < videos.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`[YouTube Videos] Successfully stored ${results.length} videos`);
    return results;
  } catch (error) {
    console.error('[YouTube Videos] Database error:', error);
    throw new Error('Failed to store videos in database');
  }
};
