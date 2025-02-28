
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import { fetchYouTubeVideos, validateYouTubeResponse } from '../_shared/youtube-api.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request
    const { channels, forceUpdate = false } = await req.json()
    console.log('Request received for channels:', channels?.length || 0, 'forceUpdate:', forceUpdate)

    if (!Array.isArray(channels) || channels.length === 0) {
      throw new Error('No channels provided')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check quota before proceeding
    const { data: quotaData, error: quotaError } = await supabase
      .from('api_quota_tracking')
      .select('*')
      .eq('api_name', 'youtube')
      .single()

    if (quotaError) {
      console.error('Error checking quota:', quotaError)
      throw new Error('Failed to check API quota')
    }

    // If quota is exhausted, return early
    if (quotaData.quota_remaining <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'YouTube API quota exceeded',
          quota_reset_at: quotaData.quota_reset_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let processedChannels = 0
    let processedVideos = 0
    const results = []
    const batchSize = 10
    let quotaUsed = 0

    // Process channels in batches to avoid overwhelming the API
    for (let i = 0; i < channels.length; i += batchSize) {
      const batch = channels.slice(i, i + batchSize)
      
      // Process each channel in the batch
      for (const channelId of batch) {
        try {
          console.log(`Processing channel: ${channelId}`)
          
          // Check if we should update this channel
          if (!forceUpdate) {
            const { data: channelData } = await supabase
              .from('youtube_channels')
              .select('last_fetch')
              .eq('channel_id', channelId)
              .single()

            if (channelData?.last_fetch) {
              const lastFetchDate = new Date(channelData.last_fetch)
              const hoursSinceLastFetch = (Date.now() - lastFetchDate.getTime()) / (1000 * 60 * 60)
              
              if (hoursSinceLastFetch < 6) { // Only fetch if it's been at least 6 hours
                console.log(`Channel ${channelId} was fetched less than 6 hours ago, skipping`)
                results.push({
                  channelId,
                  success: true,
                  skipped: true,
                  message: 'Recently updated'
                })
                continue
              }
            }
          }

          let pageToken: string | undefined = undefined
          let totalVideos = 0
          
          // Fetch videos from this channel
          try {
            const data = await fetchYouTubeVideos(channelId, pageToken)
            validateYouTubeResponse(data)
            quotaUsed += 100 // YouTube API cost per search request
            
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
                  ignoreDuplicates: false 
                })

              if (error) {
                console.error(`Error inserting videos for channel ${channelId}:`, error)
                throw error
              }

              totalVideos += videos.length
              processedVideos += videos.length
            }

            // Update channel's last_fetch timestamp
            await supabase
              .from('youtube_channels')
              .update({ 
                last_fetch: new Date().toISOString(),
                fetch_error: null
              })
              .eq('channel_id', channelId)

            processedChannels++
            results.push({
              channelId,
              success: true,
              videosAdded: totalVideos
            })

            console.log(`Successfully processed channel ${channelId}, added ${totalVideos} videos`)
          } catch (apiError) {
            console.error(`API error processing channel ${channelId}:`, apiError)
            
            // Update channel with error information
            await supabase
              .from('youtube_channels')
              .update({ 
                fetch_error: apiError.message,
                last_fetch: new Date().toISOString()
              })
              .eq('channel_id', channelId)

            results.push({
              channelId,
              success: false,
              error: apiError.message
            })
          }
        } catch (channelError) {
          console.error(`Error processing channel ${channelId}:`, channelError)
          results.push({
            channelId,
            success: false,
            error: channelError.message
          })
        }
      }

      // Wait a bit between batches to avoid rate limiting
      if (i + batchSize < channels.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Update quota tracking
    await supabase
      .from('api_quota_tracking')
      .update({ 
        quota_remaining: Math.max(0, quotaData.quota_remaining - quotaUsed),
        updated_at: new Date().toISOString()
      })
      .eq('api_name', 'youtube')

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedChannels,
        newVideos: processedVideos,
        results,
        quotaUsed
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
