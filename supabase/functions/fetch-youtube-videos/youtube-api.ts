
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
    const channelData = await channelResponse.json();

    if (!channelResponse.ok || !channelData.items?.[0]) {
      console.error(`[YouTube Videos] Error fetching channel ${channelId}:`, channelData);
      return { videos: [], nextPageToken: null };
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const channelTitle = channelData.items[0].snippet.title;

    // Fetch videos with pagination
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ''}&key=${apiKey}`;
    const response = await fetch(playlistUrl);
    const data = await response.json();

    if (!response.ok || !data.items) {
      console.error(`[YouTube Videos] Error fetching videos for channel ${channelId}:`, data);
      return { videos: [], nextPageToken: null };
    }

    // Get video IDs and fetch statistics in a single batch
    const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId);
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();

    if (!statsResponse.ok || !statsData.items) {
      console.error('[YouTube Videos] Error fetching video statistics:', statsData);
      return { videos: [], nextPageToken: null };
    }

    // Create a map for quick lookup of statistics
    const statsMap = new Map(
      statsData.items.map((item: any) => [item.id, {
        statistics: item.statistics,
        description: item.snippet.description
      }])
    );

    // Process videos with their statistics and categorization
    const processedVideos = data.items.map((item: any) => ({
      video_id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channel_id: channelId,
      channel_name: channelTitle,
      uploaded_at: item.snippet.publishedAt,
      views: parseInt(statsMap.get(item.snippet.resourceId.videoId)?.statistics.viewCount || '0'),
      description: statsMap.get(item.snippet.resourceId.videoId)?.description || null,
    }));

    return { 
      videos: processedVideos,
      nextPageToken: data.nextPageToken || null
    };
  } catch (error) {
    console.error(`[YouTube Videos] Error processing channel ${channelId}:`, error);
    return { videos: [], nextPageToken: null };
  }
};

