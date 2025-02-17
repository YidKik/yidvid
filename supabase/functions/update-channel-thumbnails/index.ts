
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all channels that need thumbnail updates
    const { data: channels, error: fetchError } = await supabaseClient
      .from('youtube_channels')
      .select('channel_id, title')
      .is('deleted_at', null)
    
    if (fetchError) {
      console.error('Error fetching channels:', fetchError)
      throw new Error('Failed to fetch channels')
    }

    // Update thumbnails for each channel
    for (const channel of channels || []) {
      try {
        // Fetch latest channel data from YouTube API
        const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channel.channel_id}&key=${youtubeApiKey}`
        )
        
        if (!response.ok) {
          console.error(`Failed to fetch channel ${channel.channel_id} from YouTube:`, response.statusText)
          continue
        }

        const data = await response.json()
        if (!data.items?.length) {
          console.error(`No data found for channel ${channel.channel_id}`)
          continue
        }

        const thumbnail = data.items[0].snippet.thumbnails?.default?.url
        if (!thumbnail) {
          console.error(`No thumbnail found for channel ${channel.channel_id}`)
          continue
        }

        // Update channel thumbnail in database
        const { error: updateError } = await supabaseClient
          .from('youtube_channels')
          .update({ 
            thumbnail_url: thumbnail,
            updated_at: new Date().toISOString()
          })
          .eq('channel_id', channel.channel_id)

        if (updateError) {
          console.error(`Error updating channel ${channel.channel_id}:`, updateError)
        }
      } catch (error) {
        console.error(`Error processing channel ${channel.channel_id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Channel thumbnails updated successfully' }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in update-channel-thumbnails function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})
