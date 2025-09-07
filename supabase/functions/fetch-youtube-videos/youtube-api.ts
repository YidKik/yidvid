
interface VideoResult {
  videos: any[];
  quotaExceeded?: boolean;
}

export async function fetchChannelVideos(
  channelId: string, 
  apiKey: string
): Promise<VideoResult> {
  try {
    console.log(`[YouTube API] Fetching videos for channel ${channelId}`);
    
    // Use primary API key as fallback if no separate fallback key is configured
    const fallbackApiKey = Deno.env.get('YOUTUBE_FALLBACK_API_KEY') || apiKey;
    
    // Simplified approach - remove complex referer switching that might be causing issues
    const defaultHeaders = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    
    // Simplified API call - try primary key first
    let channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,status&id=${channelId}&key=${apiKey}`, {
      headers: defaultHeaders
    });
    
    // If quota exceeded or forbidden response, try with fallback API key
    if (channelResponse.status === 403 || channelResponse.status === 429) {
      console.log(`[YouTube API] Primary key failed (${channelResponse.status}), trying fallback API key`);
      if (fallbackApiKey !== apiKey) {
        channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,status&id=${channelId}&key=${fallbackApiKey}`, {
          headers: defaultHeaders
        });
      }
    }
    
    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error(`[YouTube API] Channel API error for ${channelId}:`, errorText);
      console.error(`[YouTube API] Status: ${channelResponse.status} ${channelResponse.statusText}`);
      
      // Check for quota exceeded
      if (errorText.includes('quotaExceeded') || channelResponse.status === 403) {
        console.error('[YouTube API] YouTube API quota exceeded or restriction applied');
        return { videos: [], quotaExceeded: true };
      }
      
      throw new Error(`Channel API error: ${channelResponse.status} - ${errorText}`);
    }
    
    const channelData = await channelResponse.json();

    if (!channelData.items?.[0]) {
      console.error(`[YouTube API] No channel found for ID ${channelId}`);
      return { videos: [] };
    }

    // Check if channel is active and public
    const channelStatus = channelData.items[0].status;
    if (channelStatus?.privacyStatus === 'private') {
      console.error(`[YouTube API] Channel ${channelId} is private`);
      return { videos: [] };
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      console.error(`[YouTube API] No uploads playlist found for channel ${channelId}`);
      return { videos: [] };
    }

    const channelTitle = channelData.items[0].snippet.title;
    const channelThumbnail = channelData.items[0].snippet.thumbnails?.default?.url || null;
    console.log(`[YouTube API] Found channel: ${channelTitle} (${channelId})`);

    // Determine which API key to use based on previous response
    const currentApiKey = channelResponse.status === 200 ? apiKey : fallbackApiKey;
    
    // Fetch videos from uploads playlist - maximum of 50 per request (API limit)
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${currentApiKey}`;
    const response = await fetch(playlistUrl, {
      headers: defaultHeaders
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[YouTube API] Playlist API error for channel ${channelId}:`, errorText);
      console.error(`[YouTube API] Status: ${response.status} ${response.statusText}`);
      
      // Try with fallback key if main key failed and we have a different fallback key
      if (currentApiKey !== fallbackApiKey && fallbackApiKey !== apiKey) {
        console.log(`[YouTube API] Trying fallback API key for playlist request`);
        const fallbackResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${fallbackApiKey}`, 
          { headers: defaultHeaders }
        );
        
        if (!fallbackResponse.ok) {
          console.error(`[YouTube API] Fallback playlist API request also failed`);
          return { videos: [], quotaExceeded: true };
        }
        
        const fallbackData = await fallbackResponse.json();
        if (!fallbackData.items || fallbackData.items.length === 0) {
          return { videos: [] };
        }
        
        // Process with the fallback response data
        return await processVideoItems(fallbackData, channelId, channelTitle, fallbackApiKey);
      }
      
      // Check for quota exceeded
      if (errorText.includes('quotaExceeded') || response.status === 403) {
        console.error('[YouTube API] YouTube API quota exceeded or restriction applied');
        return { videos: [], quotaExceeded: true };
      }
      
      throw new Error(`Playlist API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log(`[YouTube API] No videos found in playlist for channel ${channelId}`);
      return { videos: [] };
    }

    return await processVideoItems(data, channelId, channelTitle, currentApiKey);
  } catch (error) {
    console.error(`[YouTube API] Error processing channel ${channelId}:`, error);
    // Return empty result instead of throwing to prevent cascade failures
    return { videos: [] };
  }
}

// Helper function to process video items and get statistics
async function processVideoItems(data: any, channelId: string, channelTitle: string, apiKey: string): Promise<VideoResult> {
  // Get video IDs and fetch statistics in a single batch
  const videoIds = data.items
    .map((item: any) => item.snippet?.resourceId?.videoId)
    .filter(Boolean);

  console.log(`[YouTube API] Found ${videoIds.length} videos in playlist for channel ${channelId}`);

  if (videoIds.length === 0) {
    return { videos: [] };
  }

  // Get detailed video information including statistics
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
  const defaultHeaders = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };
  const statsResponse = await fetch(statsUrl, { headers: defaultHeaders });
  
  if (!statsResponse.ok) {
    const errorText = await statsResponse.text();
    console.error(`[YouTube API] Statistics API error for channel ${channelId}:`, errorText);
    console.error(`[YouTube API] Status: ${statsResponse.status} ${statsResponse.statusText}`);
    
    // Check for quota exceeded
    if (errorText.includes('quotaExceeded') || statsResponse.status === 403) {
      console.error('[YouTube API] YouTube API quota exceeded or restriction applied');
      return { videos: [], quotaExceeded: true };
    }
    
    throw new Error(`Statistics API error: ${statsResponse.status} - ${errorText}`);
  }
  
  const statsData = await statsResponse.json();

  // Create a map for quick lookup of statistics
  const statsMap = new Map(
    statsData.items?.map((item: any) => [item.id, {
      statistics: item.statistics,
      description: item.snippet.description
    }]) || []
  );

  // Process videos with their statistics
  const processedVideos = data.items
    .filter((item: any) => {
      if (!item.snippet?.resourceId?.videoId) {
        console.log(`[YouTube API] Skipping invalid video item in channel ${channelId}`);
        return false;
      }
      return true;
    })
    .map((item: any) => {
      const videoId = item.snippet.resourceId.videoId;
      const stats = statsMap.get(videoId);
      
      return {
        video_id: videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channel_id: channelId,
        channel_name: channelTitle,
        uploaded_at: item.snippet.publishedAt,
        views: parseInt(stats?.statistics?.viewCount || '0'),
        description: stats?.description || null,
      };
    });

  console.log(`[YouTube API] Successfully processed ${processedVideos.length} videos for channel ${channelId}`);
  return { videos: processedVideos };
}
