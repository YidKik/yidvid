
interface VideoResult {
  videos: any[];
  nextPageToken: string | null;
  quotaExceeded?: boolean;
}

export const fetchChannelVideos = async (
  channelId: string, 
  apiKey: string, 
  pageToken?: string
): Promise<VideoResult> => {
  try {
    // Get channel details
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,status&id=${channelId}&key=${apiKey}`;
    const channelResponse = await fetch(channelUrl);
    
    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error(`[YouTube Videos] Channel API error for ${channelId}:`, errorText);
      
      // Check for quota exceeded
      if (errorText.includes('quotaExceeded')) {
        return { videos: [], nextPageToken: null, quotaExceeded: true };
      }
      
      throw new Error(`Channel API error: ${channelResponse.status} - ${errorText}`);
    }
    
    const channelData = await channelResponse.json();

    if (!channelData.items?.[0]) {
      console.error(`[YouTube Videos] No channel found for ID ${channelId}`);
      return { videos: [], nextPageToken: null };
    }

    // Check if channel is active and public
    const channelStatus = channelData.items[0].status;
    if (channelStatus?.privacyStatus === 'private') {
      console.error(`[YouTube Videos] Channel ${channelId} is private`);
      return { videos: [], nextPageToken: null };
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      console.error(`[YouTube Videos] No uploads playlist found for channel ${channelId}`);
      return { videos: [], nextPageToken: null };
    }

    const channelTitle = channelData.items[0].snippet.title;
    console.log(`[YouTube Videos] Fetching videos for channel: ${channelTitle} (${channelId})`);

    // Fetch videos with pagination - maximum of 50 per request (API limit)
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}${pageToken ? `&pageToken=${pageToken}` : ''}&key=${apiKey}`;
    const response = await fetch(playlistUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[YouTube Videos] Playlist API error for channel ${channelId}:`, errorText);
      
      // Check for quota exceeded
      if (errorText.includes('quotaExceeded')) {
        return { videos: [], nextPageToken: null, quotaExceeded: true };
      }
      
      throw new Error(`Playlist API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log(`[YouTube Videos] No videos found in playlist for channel ${channelId}`);
      return { videos: [], nextPageToken: null };
    }

    // Get video IDs and fetch statistics in a single batch
    const videoIds = data.items
      .map((item: any) => item.snippet.resourceId.videoId)
      .filter(Boolean);

    console.log(`[YouTube Videos] Found ${videoIds.length} videos in current page for channel ${channelId}`);

    if (videoIds.length === 0) {
      return { videos: [], nextPageToken: data.nextPageToken || null };
    }

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
    const statsResponse = await fetch(statsUrl);
    
    if (!statsResponse.ok) {
      const errorText = await statsResponse.text();
      console.error(`[YouTube Videos] Statistics API error for channel ${channelId}:`, errorText);
      
      // Check for quota exceeded
      if (errorText.includes('quotaExceeded')) {
        return { videos: [], nextPageToken: null, quotaExceeded: true };
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
          console.log(`[YouTube Videos] Skipping invalid video item in channel ${channelId}`);
          return false;
        }
        return true;
      })
      .map((item: any) => {
        const stats = statsMap.get(item.snippet.resourceId.videoId);
        if (!stats) {
          console.log(`[YouTube Videos] No stats found for video ${item.snippet.resourceId.videoId}`);
        }
        return {
          video_id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          channel_id: channelId,
          channel_name: channelTitle,
          uploaded_at: item.snippet.publishedAt,
          views: parseInt(stats?.statistics?.viewCount || '0'),
          description: stats?.description || null,
        };
      });

    console.log(`[YouTube Videos] Successfully processed ${processedVideos.length} videos for current page`);

    return { 
      videos: processedVideos,
      nextPageToken: data.nextPageToken || null
    };
  } catch (error) {
    console.error(`[YouTube Videos] Error processing channel ${channelId}:`, error);
    // Return empty result instead of throwing to prevent cascade failures
    return { videos: [], nextPageToken: null };
  }
};
