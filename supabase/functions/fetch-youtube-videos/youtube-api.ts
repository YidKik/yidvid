
interface VideoStats {
  statistics: {
    viewCount: string;
  };
  description: string;
}

interface FetchChannelVideosResult {
  videos: any[];
  nextPageToken: string | null;
}

export const fetchChannelVideos = async (
  channelId: string, 
  apiKey: string, 
  pageToken?: string
): Promise<FetchChannelVideosResult> => {
  try {
    // Get channel details
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${apiKey}`;
    const channelResponse = await fetch(channelUrl);
    
    if (!channelResponse.ok) {
      throw new Error(`Channel API error: ${channelResponse.status}`);
    }
    
    const channelData = await channelResponse.json();

    if (!channelData.items?.[0]) {
      console.error(`[YouTube Videos] No channel found for ID ${channelId}`);
      return { videos: [], nextPageToken: null };
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const channelTitle = channelData.items[0].snippet.title;

    // Fetch videos with pagination - increase maxResults to 50 for efficiency
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}${pageToken ? `&pageToken=${pageToken}` : ''}&key=${apiKey}`;
    const response = await fetch(playlistUrl);
    
    if (!response.ok) {
      throw new Error(`Playlist API error: ${response.status}`);
    }
    
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return { videos: [], nextPageToken: null };
    }

    // Get video IDs and fetch statistics in a single batch
    const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId).filter(Boolean);
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
    const statsResponse = await fetch(statsUrl);
    
    if (!statsResponse.ok) {
      throw new Error(`Statistics API error: ${statsResponse.status}`);
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
      .filter((item: any) => item.snippet?.resourceId?.videoId) // Filter out any invalid items
      .map((item: any) => {
        const stats = statsMap.get(item.snippet.resourceId.videoId);
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

    return { 
      videos: processedVideos,
      nextPageToken: data.nextPageToken || null
    };
  } catch (error) {
    console.error(`[YouTube Videos] Error processing channel ${channelId}:`, error);
    throw error; // Re-throw to allow retry logic in the main function
  }
};
