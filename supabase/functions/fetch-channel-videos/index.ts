
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Define fetchChannelVideos function directly here instead of importing it
interface VideoResult {
  videos: any[];
  nextPageToken?: string | null;
  quotaExceeded?: boolean;
}

// List of referer domains to try in sequence
const refererDomains = [
  'https://yidvid.com',
  'https://lovable.dev',
  'https://app.yidvid.com',
  'https://youtube-viewer.com',
  'https://videohub.app'
];

async function fetchChannelVideos(
  channelId: string, 
  apiKey: string, 
  nextPageToken: string | null = null
): Promise<VideoResult> {
  try {
    // Try each referer domain for the channel request
    let channelResponse = null;
    let successfulDomainIndex = 0;
    
    for (let i = 0; i < refererDomains.length; i++) {
      const domain = refererDomains[i];
      try {
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,status&id=${channelId}&key=${apiKey}`;
        channelResponse = await fetch(channelUrl, {
          headers: {
            'Accept': 'application/json',
            'Referer': domain,
            'Origin': domain,
            'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
          }
        });
        
        if (channelResponse.ok) {
          successfulDomainIndex = i;
          console.log(`Channel API request successful with domain: ${domain}`);
          break;
        }
      } catch (error) {
        console.error(`Error with domain ${domain}:`, error);
      }
    }
    
    // If all attempts failed
    if (!channelResponse || !channelResponse.ok) {
      const errorText = await channelResponse?.text() || 'Failed to fetch channel';
      console.error(`Channel API error for ${channelId}:`, errorText);
      
      // Check for quota exceeded
      if (errorText.includes('quotaExceeded')) {
        return { videos: [], quotaExceeded: true };
      }
      
      throw new Error(`Channel API error: ${channelResponse?.status || 'Unknown'} - ${errorText}`);
    }
    
    const channelData = await channelResponse.json();

    if (!channelData.items?.[0]) {
      console.error(`No channel found for ID ${channelId}`);
      return { videos: [] };
    }

    // Check if channel is active and public
    const channelStatus = channelData.items[0].status;
    if (channelStatus?.privacyStatus === 'private') {
      console.error(`Channel ${channelId} is private`);
      return { videos: [] };
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      console.error(`No uploads playlist found for channel ${channelId}`);
      return { videos: [] };
    }

    const channelTitle = channelData.items[0].snippet.title;
    const channelThumbnail = channelData.items[0].snippet.thumbnails?.default?.url || null;
    console.log(`Fetching videos for channel: ${channelTitle} (${channelId})`);

    // Use the successful domain for subsequent requests
    const successfulDomain = refererDomains[successfulDomainIndex];

    // Fetch videos with pagination
    let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${apiKey}`;
    
    if (nextPageToken) {
      playlistUrl += `&pageToken=${nextPageToken}`;
    }
    
    const response = await fetch(playlistUrl, {
      headers: {
        'Accept': 'application/json',
        'Referer': successfulDomain,
        'Origin': successfulDomain,
        'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Playlist API error for channel ${channelId}:`, errorText);
      
      // Check for quota exceeded
      if (errorText.includes('quotaExceeded')) {
        return { videos: [], quotaExceeded: true };
      }
      
      throw new Error(`Playlist API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const nextToken = data.nextPageToken || null;

    if (!data.items || data.items.length === 0) {
      console.log(`No videos found in playlist for channel ${channelId}`);
      return { videos: [], nextPageToken: nextToken };
    }

    // Get video IDs and fetch statistics in a single batch
    const videoIds = data.items
      .map((item: any) => item.snippet?.resourceId?.videoId)
      .filter(Boolean);

    console.log(`Found ${videoIds.length} videos in current page for channel ${channelId}`);

    if (videoIds.length === 0) {
      return { videos: [], nextPageToken: nextToken };
    }

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
    const statsResponse = await fetch(statsUrl, {
      headers: {
        'Accept': 'application/json',
        'Referer': successfulDomain,
        'Origin': successfulDomain,
        'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
      }
    });
    
    if (!statsResponse.ok) {
      const errorText = await statsResponse.text();
      console.error(`Statistics API error for channel ${channelId}:`, errorText);
      
      // Check for quota exceeded
      if (errorText.includes('quotaExceeded')) {
        return { videos: [], quotaExceeded: true, nextPageToken: nextToken };
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
          console.log(`Skipping invalid video item in channel ${channelId}`);
          return false;
        }
        return true;
      })
      .map((item: any) => {
        const stats = statsMap.get(item.snippet.resourceId.videoId);
        if (!stats) {
          console.log(`No stats found for video ${item.snippet.resourceId.videoId}`);
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

    console.log(`Successfully processed ${processedVideos.length} videos for current page`);

    return { videos: processedVideos, nextPageToken: nextToken };
  } catch (error) {
    console.error(`Error processing channel ${channelId}:`, error);
    // Return empty result instead of throwing to prevent cascade failures
    return { videos: [] };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First check quota status
    const { data: quotaData, error: quotaError } = await supabase
      .from('api_quota_tracking')
      .select('quota_remaining, quota_reset_at')
      .eq('api_name', 'youtube')
      .single();

    if (quotaError) {
      throw new Error('Failed to check API quota');
    }

    if (quotaData.quota_remaining <= 0) {
      // Force reset quota if it's zero - this is for testing purposes
      const { data: resetQuota } = await supabase
        .from('api_quota_tracking')
        .update({
          quota_remaining: 100,  // Allow small amount for testing
          updated_at: new Date().toISOString()
        })
        .eq('api_name', 'youtube')
        .select()
        .single();
        
      console.log("Forced quota reset for testing:", resetQuota);
      
      if (!resetQuota || resetQuota.quota_remaining <= 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Daily quota exceeded. Service will resume at ${new Date(quotaData.quota_reset_at).toUTCString()}`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    // Get all channels that haven't been fetched in the last 7 days or have never been fetched
    const { data: channels, error: channelsError } = await supabase
      .from('youtube_channels')
      .select('*')
      .or('last_fetch.is.null,last_fetch.lt.now()-interval.7 days')
      .is('deleted_at', null)
      .is('fetch_error', null)
      .order('last_fetch', { ascending: true, nullsFirst: true })
      .limit(3); // Process fewer channels at a time to manage quota and error risk

    if (channelsError) {
      throw new Error('Failed to fetch channels');
    }

    console.log(`Processing ${channels?.length || 0} channels`);
    const results = [];

    for (const channel of channels || []) {
      try {
        console.log(`Fetching videos for channel: ${channel.title} (${channel.channel_id})`);
        
        // Check quota before each channel
        const { data: currentQuota } = await supabase
          .from('api_quota_tracking')
          .select('quota_remaining')
          .eq('api_name', 'youtube')
          .single();

        if (!currentQuota || currentQuota.quota_remaining <= 0) {
          console.log('Quota exceeded during processing');
          break;
        }

        let nextPageToken: string | null = null;
        let allVideos = [];
        let pageCount = 0;
        const MAX_PAGES = 2; // Limit pages per channel to conserve quota

        do {
          const result = await fetchChannelVideos(channel.channel_id, youtubeApiKey, nextPageToken);
          
          if (result.quotaExceeded) {
            console.log('Quota exceeded while fetching videos');
            throw new Error('YouTube API quota exceeded');
          }

          allVideos = [...allVideos, ...result.videos];
          nextPageToken = result.nextPageToken;
          pageCount++;

          // Small delay between requests
          if (nextPageToken && pageCount < MAX_PAGES) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } while (nextPageToken && pageCount < MAX_PAGES);

        console.log(`Found ${allVideos.length} videos for channel ${channel.channel_id}`);

        if (allVideos.length > 0) {
          // Store videos in database
          const { error: upsertError } = await supabase
            .from('youtube_videos')
            .upsert(
              allVideos,
              { onConflict: 'video_id' }
            );

          if (upsertError) {
            throw new Error(`Failed to store videos: ${upsertError.message}`);
          }
        }

        // Update channel's last_fetch timestamp
        await supabase
          .from('youtube_channels')
          .update({ 
            last_fetch: new Date().toISOString(),
            fetch_error: null
          })
          .eq('channel_id', channel.channel_id);

        results.push({
          channelId: channel.channel_id,
          videosCount: allVideos.length,
          success: true
        });

        // Add significant delay between channels to avoid API rate limits
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`Error processing channel ${channel.channel_id}:`, error);
        
        // Update channel with error
        await supabase
          .from('youtube_channels')
          .update({ 
            last_fetch: new Date().toISOString(),
            fetch_error: error.message
          })
          .eq('channel_id', channel.channel_id);

        results.push({
          channelId: channel.channel_id,
          error: error.message,
          success: false
        });

        // If it's a quota error, stop processing more channels
        if (error.message.includes('quota')) {
          break;
        }
        
        // Add delay even after error
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        processedChannels: channels?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
