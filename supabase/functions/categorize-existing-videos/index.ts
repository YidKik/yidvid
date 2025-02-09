
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
      .limit(5) // Reduced batch size to avoid rate limits

    if (fetchError) {
      console.error('Error fetching videos:', fetchError)
      return new Response(
        JSON.stringify({ error: fetchError.message }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
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
      return new Response(
        JSON.stringify({ error: 'Missing Gemini API key' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Process videos with longer delays between requests
    const results = []
    for (const video of videos) {
      try {
        if (!video.title) {
          console.log(`Skipping video ${video.id} - missing title`)
          continue
        }

        const prompt = `Based on this YouTube video title: "${video.title}", classify it into exactly one of these categories: music, torah, inspiration, podcast, education, entertainment, other. Only respond with a single word from the given categories in lowercase, nothing else.`

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
              temperature: 0,
              maxOutputTokens: 5,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE"
              }
            ]
          }),
        })

        if (!response.ok) {
          console.error(`Gemini API error: ${response.status} ${response.statusText}`)
          const errorText = await response.text()
          console.error('Error details:', errorText)
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

        // Add a longer delay between requests (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error)
        results.push({ id: video.id, error: error.message, success: false })
        // Still add delay even on error to maintain rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))
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
