import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface YouTubeApiResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl?: string;
      publishedAt: string;
      thumbnails: {
        default: {
          url: string;
          width: number;
          height: number;
        };
      };
      localized?: {
        title: string;
        description: string;
      };
    };
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { channelId } = await req.json()
    console.log('Received request for channel:', channelId)

    if (!channelId) {
      throw new Error('Channel ID is required')
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key not found')
      throw new Error('YouTube API key not configured')
    }

    // Extract channel ID from URL or handle
    const extractedId = extractChannelIdentifier(channelId)
    console.log('Extracted channel identifier:', extractedId)

    // First try to get channel by handle
    let apiUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&key=${YOUTUBE_API_KEY}`
    if (extractedId.startsWith('@')) {
      apiUrl += `&forHandle=${extractedId.substring(1)}`
    } else {
      // Try as channel ID
      apiUrl += `&id=${extractedId}`
    }

    console.log('Making YouTube API request...')
    const response = await fetch(apiUrl)
    const data: YouTubeApiResponse = await response.json()

    if (!response.ok) {
      console.error('YouTube API error:', data)
      throw new Error(`YouTube API error: ${response.statusText}`)
    }

    if (!data.items || data.items.length === 0) {
      console.error('No channel found:', data)
      throw new Error('Channel not found')
    }

    const channel = data.items[0]
    console.log('Channel data received:', channel)

    // Connect to Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if channel already exists
    const { data: existingChannel, error: checkError } = await supabaseClient
      .from('youtube_channels')
      .select('channel_id')
      .eq('channel_id', channel.id)
      .single()

    if (existingChannel) {
      throw new Error('This channel has already been added')
    }

    // Insert the new channel
    const { data: insertedChannel, error: insertError } = await supabaseClient
      .from('youtube_channels')
      .insert({
        channel_id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description || '',
        thumbnail_url: channel.snippet.thumbnails.default.url,
        default_category: 'other' // Set default category
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting channel:', insertError)
      throw new Error('Failed to add channel to database')
    }

    // After successful channel insertion, trigger video fetch
    console.log('Fetching videos for new channel...')
    
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
    
    // Make a direct fetch call to the edge function with proper headers
    const edgeResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/fetch-youtube-videos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'apikey': ANON_KEY || '', // Add the apikey header
        },
        body: JSON.stringify({
          channels: [channel.id],
          forceUpdate: true
        })
      }
    );

    if (!edgeResponse.ok) {
      const errorText = await edgeResponse.text();
      console.error('Error fetching videos:', errorText);
      // Log more details about the request
      console.log('Request URL:', `${Deno.env.get('SUPABASE_URL')}/functions/v1/fetch-youtube-videos`);
      console.log('Channel ID:', channel.id);
    } else {
      const result = await edgeResponse.json();
      console.log('Videos fetch result:', result);
    }

    return new Response(
      JSON.stringify(insertedChannel),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in fetch-youtube-channel:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function extractChannelIdentifier(input: string): string {
  let channelId = input.trim()
  
  // Handle full URLs
  if (channelId.includes('youtube.com/')) {
    // Handle various URL formats
    const urlPatterns = [
      /youtube\.com\/(?:channel|c)\/([^/?&]+)/,  // Standard channel URLs
      /youtube\.com\/(@[\w-]+)/,                 // Handle URLs
      /youtube\.com\/user\/([^/?&]+)/            // Legacy username URLs
    ]

    for (const pattern of urlPatterns) {
      const match = channelId.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
  }

  // Handle direct channel IDs or handles
  if (channelId.startsWith('UC') || channelId.startsWith('@')) {
    return channelId
  }

  // If no patterns match, return the input as-is
  return channelId
}
