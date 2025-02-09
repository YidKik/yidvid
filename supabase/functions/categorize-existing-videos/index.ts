
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

    // Fetch all videos that don't have a category yet
    const { data: videos, error: fetchError } = await supabaseClient
      .from('youtube_videos')
      .select('*')
      .is('category', null)

    if (fetchError) throw fetchError

    console.log(`Found ${videos?.length || 0} uncategorized videos`)

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key')
    }

    // Process videos in batches to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < (videos?.length || 0); i += batchSize) {
      const batch = videos.slice(i, i + batchSize)
      
      const promises = batch.map(async (video) => {
        const prompt = `Based on this video title: "${video.title}" and description: "${video.description}", 
        categorize it into exactly ONE of these categories: music, torah, inspiration, podcast, education, entertainment, other.
        Only respond with the category name in lowercase, nothing else.`

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [
                { role: 'system', content: 'You are a helpful assistant that categorizes videos. Only respond with the category name.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.3,
              max_tokens: 10
            }),
          })

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`)
          }

          const data = await response.json()
          const category = data.choices[0].message.content.trim().toLowerCase()

          // Update the video with its category
          const { error: updateError } = await supabaseClient
            .from('youtube_videos')
            .update({ category })
            .eq('id', video.id)

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
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < videos.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${videos?.length || 0} videos` 
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
