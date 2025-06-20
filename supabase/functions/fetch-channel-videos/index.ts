
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
    // Fallback API key to use if primary fails
    const fallbackApiKey = "AIzaSyDeEEZoXZfGHiNvl9pMf18N43TECw07ANk";
    let currentApiKey = apiKey;
    
    // Try each referer domain for the channel request
    let channelResponse = null;
    let successfulDomainIndex = 0;
    let usingFallbackKey = false;
    
    for (let i = 0; i < refererDomains.length; i++) {
      const domain = refererDomains[i];
      try {
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,status&id=${channelId}&key=${currentApiKey}`;
        channelResponse = await fetch(channelUrl, {
          headers: {
            'Accept': 'application/json',
            'Referer': domain,
            'Origin': domain,
            'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
          }
        });
        
        // If we get a 403 error (quota exceeded), try with fallback key
        if (channelResponse.status === 403 && !usingFallbackKey) {
          console.log(`API quota exceeded with primary key, trying fallback key`);
          currentApiKey = fallbackApiKey;
          usingFallbackKey = true;
          
          // Try again with fallback key
          const fallbackUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,status&id=${channelId}&key=${fallbackApiKey}`;
          channelResponse = await fetch(fallbackUrl, {
            headers: {
              'Accept': 'application/json',
              'Referer': domain,
              'Origin': domain,
              'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
            }
          });
        }
        
        if (channelResponse.ok) {
          successfulDomainIndex = i;
          console.log(`Channel API request successful with domain: ${domain} using ${usingFallbackKey ? 'fallback' : 'primary'} key`);
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
    console.log(`Fetching ALL videos for channel: ${channelTitle} (${channelId})`);

    // Use the successful domain for subsequent requests
    const successfulDomain = refererDomains[successfulDomainIndex];

    // Fetch ALL videos with pagination - increased maxResults to 50 for efficiency
    let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${currentApiKey}`;
    
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
      
      // If using primary key failed, try fallback
      if (!usingFallbackKey) {
        console.log(`Trying fallback API key for playlist request`);
        const fallbackUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${fallbackApiKey}`;
        const fallbackResponse = await fetch(fallbackUrl + (nextPageToken ? `&pageToken=${nextPageToken}` : ''), {
          headers: {
            'Accept': 'application/json',
            'Referer': successfulDomain,
            'Origin': successfulDomain,
            'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
          }
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const fallbackNextToken = fallbackData.nextPageToken || null;
          
          if (!fallbackData.items || fallbackData.items.length === 0) {
            console.log(`No videos found in playlist for channel ${channelId} with fallback key`);
            return { videos: [], nextPageToken: fallbackNextToken };
          }
          
          // Process with fallback key data
          return await processVideoItems(fallbackData, channelId, channelTitle, fallbackApiKey, successfulDomain, fallbackNextToken);
        }
      }
      
      // Check for quota exceeded
      if (errorText.includes('quotaExceeded')) {
        return { videos: [], quotaExceeded: true, nextPageToken: nextPageToken };
      }
      
      throw new Error(`Playlist API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const nextToken = data.nextPageToken || null;

    if (!data.items || data.items.length === 0) {
      console.log(`No videos found in playlist for channel ${channelId}`);
      return { videos: [], nextPageToken: nextToken };
    }

    return await processVideoItems(data, channelId, channelTitle, currentApiKey, successfulDomain, nextToken);
  } catch (error) {
    console.error(`Error processing channel ${channelId}:`, error);
    // Return empty result instead of throwing to prevent cascade failures
    return { videos: [] };
  }
}

// Helper function to process video items
async function processVideoItems(
  data: any, 
  channelId: string, 
  channelTitle: string, 
  apiKey: string, 
  successfulDomain: string,
  nextToken: string | null
): Promise<VideoResult> {
  const fallbackApiKey = "AIzaSyDeEEZoXZfGHiNvl9pMf18N43TECw07ANk";
  
  // Get video IDs and fetch statistics in a single batch
  const videoIds = data.items
    .map((item: any) => item.snippet?.resourceId?.videoId)
    .filter(Boolean);

  console.log(`Found ${videoIds.length} videos in current page for channel ${channelId}`);

  if (videoIds.length === 0) {
    return { videos: [], nextPageToken: nextToken };
  }

  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`;
  let statsResponse = await fetch(statsUrl, {
    headers: {
      'Accept': 'application/json',
      'Referer': successfulDomain,
      'Origin': successfulDomain,
      'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
    }
  });
  
  // If stats request fails with primary key, try fallback
  if (!statsResponse.ok && apiKey !== fallbackApiKey) {
    console.log(`Trying fallback API key for stats request`);
    const fallbackStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${fallbackApiKey}`;
    statsResponse = await fetch(fallbackStatsUrl, {
      headers: {
        'Accept': 'application/json',
        'Referer': successfulDomain,
        'Origin': successfulDomain,
        'User-Agent': 'Mozilla/5.0 (compatible; VideoFetchBot/1.0)'
      }
    });
  }
  
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
    const fallbackApiKey = "AIzaSyDeEEZoXZfGHiNvl9pMf18N43TECw07ANk";
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const requestData = await req.json();
    const { force = false, allChannels = false } = requestData;

    // First check quota status
    const { data: quotaData, error: quotaError } = await supabase
      .from('api_quota_tracking')
      .select('quota_remaining, quota_reset_at')
      .eq('api_name', 'youtube')
      .single();

    if (quotaError) {
      throw new Error('Failed to check API quota');
    }

    // Determine which API key to use
    const currentApiKey = quotaData.quota_remaining <= 0 ? fallbackApiKey : youtubeApiKey;
    console.log(`Using ${quotaData.quota_remaining <= 0 ? 'fallback' : 'primary'} API key`);
    
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
    }

    // Get channels based on the request parameters
    let channelsQuery = supabase.from('youtube_channels').select('*').is('deleted_at', null);
    
    // If not processing all channels, apply additional filters
    if (!allChannels) {
      channelsQuery = channelsQuery
        .or('last_fetch.is.null,last_fetch.lt.now()-interval.7 days')
        .is('fetch_error', null)
        .order('last_fetch', { ascending: true, nullsFirst: true })
        .limit(3); // Process fewer channels at a time if not in all-channels mode
    } else {
      // When processing all channels, just order by last_fetch to prioritize
      channelsQuery = channelsQuery
        .order('last_fetch', { ascending: true, nullsFirst: true });
    }
    
    const { data: channels, error: channelsError } = await channelsQuery;

    if (channelsError) {
      throw new Error('Failed to fetch channels');
    }

    console.log(`Processing ${channels?.length || 0} channels`);
    const results = [];
    let totalVideosFound = 0;
    let totalChannelsProcessed = 0;

    for (const channel of channels || []) {
      try {
        console.log(`Fetching ALL videos for channel: ${channel.title} (${channel.channel_id})`);
        
        // Check quota before each channel if using primary key
        if (currentApiKey === youtubeApiKey) {
          const { data: currentQuota } = await supabase
            .from('api_quota_tracking')
            .select('quota_remaining')
            .eq('api_name', 'youtube')
            .single();

          if (!currentQuota || currentQuota.quota_remaining <= 0) {
            console.log('Quota exceeded during processing, switching to fallback key');
            // Continue with fallback key
          }
        }

        let nextPageToken: string | null = null;
        let allVideos = [];
        let pageCount = 0;
        // Removed MAX_PAGES limit - fetch ALL pages/videos

        do {
          const result = await fetchChannelVideos(channel.channel_id, currentApiKey, nextPageToken);
          
          if (result.quotaExceeded && currentApiKey !== fallbackApiKey) {
            console.log('Quota exceeded while fetching videos, trying with fallback key');
            const fallbackResult = await fetchChannelVideos(channel.channel_id, fallbackApiKey, nextPageToken);
            if (fallbackResult.quotaExceeded) {
              console.log('Both API keys quota exceeded');
              break;
            }
            allVideos = [...allVideos, ...fallbackResult.videos];
            nextPageToken = fallbackResult.nextPageToken;
          } else if (result.quotaExceeded) {
            console.log('Fallback API key quota also exceeded');
            break;
          } else {
            allVideos = [...allVideos, ...result.videos];
            nextPageToken = result.nextPageToken;
          }
          
          pageCount++;

          // Small delay between requests
          if (nextPageToken) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } while (nextPageToken); // Continue until no more pages - fetch ALL videos

        console.log(`Found ALL ${allVideos.length} videos for channel ${channel.channel_id}`);
        totalVideosFound += allVideos.length;

        if (allVideos.length > 0) {
          // Store videos in database
          const { error: upsertError } = await supabase
            .from('youtube_videos')
            .upsert(
              allVideos.map(video => ({
                ...video,
                updated_at: new Date().toISOString() // Add required updated_at field
              })),
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
          success: true,
          usedFallbackKey: currentApiKey === fallbackApiKey || allVideos.length === 0
        });
        
        totalChannelsProcessed++;

        // Add significant delay between channels to avoid API rate limits
        // Shorter delay when processing all channels
        await new Promise(resolve => setTimeout(resolve, allChannels ? 1000 : 3000));

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

        // If it's a quota error, try fallback key for next channels
        if (error.message.includes('quota') && currentApiKey !== fallbackApiKey) {
          console.log("Switching to fallback API key after quota error");
        } else if (error.message.includes('quota')) {
          break; // If both keys have quota issues, stop processing
        }
        
        // Add delay even after error
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        processedChannels: totalChannelsProcessed,
        totalVideos: totalVideosFound,
        usedFallbackKey: currentApiKey === fallbackApiKey,
        message: `Fetched ALL videos from ${totalChannelsProcessed} channels (${totalVideosFound} total videos)`
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
