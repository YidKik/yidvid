
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const processChannel = async (
  supabase: SupabaseClient,
  channelId: string,
  apiKey: string,
  quotaData: any,
  now: Date
) => {
  console.log(`[Channel Processor] Processing channel: ${channelId}`);

  try {
    // Fetch channel details first
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (!channelData.items?.[0]) {
      throw new Error('Channel not found');
    }

    const channel = channelData.items[0];
    
    // Fetch all videos for the channel without date restriction
    const videos = await fetchAllVideosForChannel(channelId, apiKey, quotaData);
    console.log(`[Channel Processor] Found ${videos.length} total videos for channel ${channelId}`);

    // Format videos for database
    const formattedVideos = videos.map(video => ({
      video_id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
      channel_id: channelId,
      channel_name: channel.snippet.title,
      uploaded_at: video.snippet.publishedAt,
      views: video.statistics?.viewCount ? parseInt(video.statistics.viewCount) : 0
    }));

    // Store videos in database
    const { data: storedVideos, error: storeError } = await supabase
      .from('youtube_videos')
      .upsert(
        formattedVideos,
        { 
          onConflict: 'video_id',
          ignoreDuplicates: false 
        }
      );

    if (storeError) {
      throw storeError;
    }

    // Update channel's last fetch time
    await updateChannelStatus(supabase, channelId, now);
    await logChannelUpdate(supabase, channelId, videos.length);

    return {
      videos: formattedVideos,
      quotaExceeded: false
    };

  } catch (error) {
    console.error(`[Channel Processor] Error processing channel ${channelId}:`, error);
    throw error;
  }
};

const fetchAllVideosForChannel = async (channelId: string, apiKey: string, quotaData: any) => {
  let allVideos = [];
  let pageToken = '';
  const maxResults = 50; // Maximum allowed by YouTube API
  
  do {
    if (quotaData.quota_remaining <= 0) {
      console.log('[Channel Processor] Quota exceeded during video fetch');
      return allVideos;
    }

    const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    if (!videosData.items) {
      break;
    }

    // Fetch additional video details (including view counts)
    const videoIds = videosData.items.map((item: any) => item.id.videoId).join(',');
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    allVideos.push(...(detailsData.items || []));
    pageToken = videosData.nextPageToken;

    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

  } while (pageToken);

  return allVideos;
};

export const updateChannelStatus = async (
  supabase: SupabaseClient,
  channelId: string,
  timestamp: Date,
  error?: string
) => {
  const { error: updateError } = await supabase
    .from('youtube_channels')
    .update({
      last_fetch: timestamp.toISOString(),
      fetch_error: error || null
    })
    .eq('channel_id', channelId);

  if (updateError) {
    console.error(`[Channel Processor] Error updating channel status:`, updateError);
  }
};

export const logChannelUpdate = async (
  supabase: SupabaseClient,
  channelId: string,
  videosCount: number,
  error?: string
) => {
  const { error: logError } = await supabase
    .from('youtube_update_logs')
    .insert({
      channel_id: channelId,
      videos_count: videosCount,
      error: error
    });

  if (logError) {
    console.error(`[Channel Processor] Error logging channel update:`, logError);
  }
};
