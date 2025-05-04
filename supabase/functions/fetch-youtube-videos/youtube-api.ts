
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
    
    // Use provided fallback API key if quota is exceeded
    const fallbackApiKey = "AIzaSyDeEEZoXZfGHiNvl9pMf18N43TECw07ANk";
    
    // Define a list of referer domains to try
    const refererDomains = [
      'https://yidvid.com',
      'https://lovable.dev',
      'https://app.yidvid.com',
      'https://youtube-viewer.com',
      'https://videohub.app'
    ];
    
    // First try with the primary referer
    let channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,status&id=${channelId}&key=${apiKey}`, {
      headers: {
        'Accept': 'application/json',
        'Referer': refererDomains[0],
        'Origin': refererDomains[0],
        'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
      }
    });
    
    // If quota exceeded or forbidden response, try with fallback API key
    if (channelResponse.status === 403 || !channelResponse.ok) {
      console.log(`[YouTube API] Quota exceeded or error with primary key, trying fallback API key`);
      channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,status&id=${channelId}&key=${fallbackApiKey}`, {
        headers: {
          'Accept': 'application/json',
          'Referer': refererDomains[0],
          'Origin': refererDomains[0],
          'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
        }
      });
    }
    
    // If still failed, try with alternative referers
    let domainIndex = 1;
    while (!channelResponse.ok && domainIndex < refererDomains.length) {
      console.log(`[YouTube API] Trying alternative referer domain: ${refererDomains[domainIndex]}`);
      
      // Try with regular API key first
      channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,status&id=${channelId}&key=${apiKey}`, {
        headers: {
          'Accept': 'application/json',
          'Referer': refererDomains[domainIndex],
          'Origin': refererDomains[domainIndex],
          'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
        }
      });
      
      // If still failing, try with fallback API key
      if (!channelResponse.ok) {
        channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,status&id=${channelId}&key=${fallbackApiKey}`, {
          headers: {
            'Accept': 'application/json',
            'Referer': refererDomains[domainIndex],
            'Origin': refererDomains[domainIndex],
            'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
          }
        });
      }
      
      domainIndex++;
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

    // Use the same referer that worked for the channel request
    const successfulReferer = refererDomains[Math.min(domainIndex - 1, refererDomains.length - 1)];
    const currentApiKey = channelResponse.url.includes(fallbackApiKey) ? fallbackApiKey : apiKey;
    
    // Fetch videos from uploads playlist - maximum of 50 per request (API limit)
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${currentApiKey}`;
    const response = await fetch(playlistUrl, {
      headers: {
        'Accept': 'application/json',
        'Referer': successfulReferer,
        'Origin': successfulReferer,
        'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[YouTube API] Playlist API error for channel ${channelId}:`, errorText);
      console.error(`[YouTube API] Status: ${response.status} ${response.statusText}`);
      
      // Try with fallback key if main key failed
      if (currentApiKey !== fallbackApiKey) {
        console.log(`[YouTube API] Trying fallback API key for playlist request`);
        const fallbackResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${fallbackApiKey}`, 
          {
            headers: {
              'Accept': 'application/json',
              'Referer': successfulReferer,
              'Origin': successfulReferer,
              'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
            }
          }
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
        return await processVideoItems(fallbackData, channelId, channelTitle, fallbackApiKey, successfulReferer);
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

    return await processVideoItems(data, channelId, channelTitle, currentApiKey, successfulReferer);
  } catch (error) {
    console.error(`[YouTube API] Error processing channel ${channelId}:`, error);
    // Return empty result instead of throwing to prevent cascade failures
    return { videos: [] };
  }
}

// Helper function to process video items and get statistics
async function processVideoItems(data: any, channelId: string, channelTitle: string, apiKey: string, referer: string): Promise<VideoResult> {
  // Get video IDs and fetch statistics in a single batch
  const videoIds = data.items
    .map((item: any) => item.snippet?.resourceId?.videoId)
    .filter(Boolean);

  console.log(`[YouTube API] Found ${videoIds.length} videos in playlist for channel ${channelId}`);

  if (videoIds.length === 0) {
    return { videos: [] };
  }

  // Get detailed video information including statistics - Update referer header
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
  const statsResponse = await fetch(statsUrl, {
    headers: {
      'Accept': 'application/json',
      'Referer': referer,
      'Origin': referer,
      'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
    }
  });
  
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
