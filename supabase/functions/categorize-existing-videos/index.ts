
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

    // Process only uncategorized videos
    const { data: videos, error: fetchError } = await supabaseClient
      .from('youtube_videos')
      .select('*')
      .is('category', null)
      .is('deleted_at', null)
      .limit(10) // Process in smaller batches

    if (fetchError) {
      console.error('Error fetching videos:', fetchError)
      throw fetchError
    }

    if (!videos || videos.length === 0) {
      console.log('No uncategorized videos found')
      return new Response(
        JSON.stringify({ success: true, message: 'No videos to categorize' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${videos.length} videos to process`)

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Missing Gemini API key')
    }

    // Process videos one by one to avoid rate limits
    const results = []
    for (const video of videos) {
      try {
        if (!video.title) {
          console.log(`Skipping video ${video.id} - missing title`)
          continue
        }

        const prompt = `Based on this video title: "${video.title}", categorize it into exactly ONE of these categories: music, torah, inspiration, podcast, education, entertainment, other. Only respond with the category name in lowercase, nothing else.`

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
              temperature: 0.1,
              maxOutputTokens: 5,
            }
          }),
        })

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Invalid response from Gemini API')
        }
        
        const category = data.candidates[0].content.parts[0].text.trim().toLowerCase()

        // Validate category
        const validCategories = ['music', 'torah', 'inspiration', 'podcast', 'education', 'entertainment', 'other']
        if (!validCategories.includes(category)) {
          throw new Error(`Invalid category returned: ${category}`)
        }

        // Update the video with its category
        const { error: updateError } = await supabaseClient
          .from('youtube_videos')
          .update({ category })
          .eq('id', video.id)

        if (updateError) throw updateError

        console.log(`Successfully categorized video ${video.id} as ${category}`)
        results.push({ id: video.id, category, success: true })

        // Add a delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error)
        results.push({ id: video.id, error: error.message, success: false })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: `Processed ${results.length} videos` 
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
