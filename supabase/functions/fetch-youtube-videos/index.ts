
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import { fetchYouTubeVideos, validateYouTubeResponse } from '../_shared/youtube-api.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { channels, forceUpdate = false } = await req.json()
    console.log('Request received for channels:', channels, 'forceUpdate:', forceUpdate)

    if (!Array.isArray(channels) || channels.length === 0) {
      throw new Error('No channels provided')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let processedVideos = 0
    const results = []

    for (const channelId of channels) {
      try {
        console.log(`Processing channel: ${channelId}`)
        
        // Check if we should update this channel
        if (!forceUpdate) {
          const { data: lastFetch } = await supabase
            .from('youtube_channels')
            .select('last_fetch')
            .eq('channel_id', channelId)
            .single()

          if (lastFetch?.last_fetch) {
            const lastFetchDate = new Date(lastFetch.last_fetch)
            const hoursSinceLastFetch = (Date.now() - lastFetchDate.getTime()) / (1000 * 60 * 60)
            
            if (hoursSinceLastFetch < 24) {
              console.log(`Channel ${channelId} was fetched less than 24 hours ago, skipping`)
              continue
            }
          }
        }

        let pageToken: string | undefined = undefined
        let totalVideos = 0
        
        do {
          const data = await fetchYouTubeVideos(channelId, pageToken)
          validateYouTubeResponse(data)
          
          const videos = data.items.map((item: any) => ({
            video_id: item.id.videoId,
            channel_id: channelId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            channel_name: item.snippet.channelTitle,
            uploaded_at: item.snippet.publishedAt
          }))

          if (videos.length > 0) {
            const { error } = await supabase
              .from('youtube_videos')
              .upsert(videos, { 
                onConflict: 'video_id',
                ignoreDuplicates: true 
              })

            if (error) {
              console.error(`Error inserting videos for channel ${channelId}:`, error)
              throw error
            }

            totalVideos += videos.length
            processedVideos += videos.length
          }

          pageToken = data.nextPageToken
        } while (pageToken)

        // Update channel's last_fetch timestamp
        await supabase
          .from('youtube_channels')
          .update({ 
            last_fetch: new Date().toISOString(),
            fetch_error: null
          })
          .eq('channel_id', channelId)

        results.push({
          channelId,
          success: true,
          videosAdded: totalVideos
        })

        console.log(`Successfully processed channel ${channelId}, added ${totalVideos} videos`)

      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error)
        
        // Update channel with error information
        await supabase
          .from('youtube_channels')
          .update({ 
            fetch_error: error.message,
            last_fetch: new Date().toISOString()
          })
          .eq('channel_id', channelId)

        results.push({
          channelId,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: channels.length,
        videosAdded: processedVideos,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-youtube-videos:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
