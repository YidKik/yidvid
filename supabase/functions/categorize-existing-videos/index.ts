
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
      .limit(5)

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

    // Define category keyword mapping
    const categoryKeywords = {
      music: ['music', 'song', 'singer', 'concert', 'melody', 'rhythm', 'dance'],
      torah: ['torah', 'rabbi', 'jewish', 'judaism', 'parsha', 'dvar', 'talmud', 'mitzvah'],
      inspiration: ['inspiration', 'motivate', 'encourage', 'uplift', 'spiritual'],
      podcast: ['podcast', 'episode', 'interview', 'conversation', 'talk', 'discussion'],
      education: ['education', 'learn', 'teach', 'school', 'lesson', 'tutorial', 'guide'],
      entertainment: ['entertainment', 'funny', 'comedy', 'humor', 'joke', 'laugh']
    };

    // Process videos
    const results = []
    for (const video of videos) {
      try {
        if (!video.title) {
          console.log(`Skipping video ${video.id} - missing title`)
          continue
        }

        // Simple rule-based categorization
        const videoText = video.title.toLowerCase() + ' ' + (video.description || '').toLowerCase();
        
        // Count keyword matches for each category
        const matches = Object.entries(categoryKeywords).map(([category, keywords]) => {
          const matchCount = keywords.filter(keyword => videoText.includes(keyword)).length;
          return { category, matchCount };
        });
        
        // Find category with most matches
        matches.sort((a, b) => b.matchCount - a.matchCount);
        
        // If no matches found, use 'other' category
        const category = matches[0].matchCount > 0 ? matches[0].category : 'other';

        // Update the video with its category
        const { error: updateError } = await supabaseClient
          .from('youtube_videos')
          .update({ category })
          .eq('id', video.id)

        if (updateError) throw updateError

        console.log(`Successfully categorized video ${video.id} as ${category}`)
        results.push({ id: video.id, category, success: true })

        // Add a delay between requests
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error)
        results.push({ id: video.id, error: error.message, success: false })
        await new Promise(resolve => setTimeout(resolve, 100))
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
