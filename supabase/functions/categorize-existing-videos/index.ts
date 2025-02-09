
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Paginate through videos to avoid memory issues
    const pageSize = 20
    let processedCount = 0
    let hasMore = true
    let currentPage = 0

    while (hasMore) {
      console.log(`Processing page ${currentPage + 1}`)
      
      const { data: videos, error: fetchError } = await supabaseClient
        .from('youtube_videos')
        .select('*')
        .is('deleted_at', null)
        .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1)
        .order('id', { ascending: true })

      if (fetchError) {
        console.error('Error fetching videos:', fetchError)
        throw fetchError
      }

      if (!videos || videos.length === 0) {
        hasMore = false
        break
      }

      console.log(`Found ${videos.length} videos to process in current page`)

      const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
      if (!geminiApiKey) {
        throw new Error('Missing Gemini API key')
      }

      // Process videos in smaller batches
      const batchSize = 2
      for (let i = 0; i < videos.length; i += batchSize) {
        const batch = videos.slice(i, i + batchSize)
        
        const promises = batch.map(async (video) => {
          if (!video.video_id) {
            console.log(`Skipping video ${video.id} - missing video_id`)
            return { id: video.id, error: 'Missing video_id', success: false }
          }

          const prompt = `Based on this video title: "${video.title}" and description: "${video.description || ''}", 
          categorize it into exactly ONE of these categories: music, torah, inspiration, podcast, education, entertainment, other.
          Only respond with the category name in lowercase, nothing else.`

          try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiApiKey,
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: prompt
                  }]
                }],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 10,
                }
              }),
            })

            if (!response.ok) {
              throw new Error(`Gemini API error: ${response.statusText}`)
            }

            const data = await response.json()
            const category = data.candidates[0].content.parts[0].text.trim().toLowerCase()

            // Update the video with its category
            const { error: updateError } = await supabaseClient
              .from("youtube_videos")
              .update({ category })
              .eq("id", video.id)

            if (updateError) throw updateError

            console.log(`Successfully categorized video ${video.id} as ${category}`)
            return { id: video.id, category, success: true }
          } catch (error) {
            console.error(`Error categorizing video ${video.id}:`, error)
            return { id: video.id, error: error.message, success: false }
          }
        })

        const results = await Promise.all(promises)
        console.log(`Batch results:`, results)
        
        // Add a longer delay between batches
        if (i + batchSize < videos.length) {
          console.log('Waiting between batches...')
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }

      processedCount += videos.length
      currentPage++

      // Add delay between pages
      console.log('Waiting between pages...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${processedCount} videos` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in categorize-existing-videos function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
