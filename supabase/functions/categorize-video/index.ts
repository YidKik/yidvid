
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { title, description } = await req.json()
    
    // Define category keyword mapping
    const categoryKeywords = {
      music: ['music', 'song', 'singer', 'concert', 'melody', 'rhythm', 'dance'],
      torah: ['torah', 'rabbi', 'jewish', 'judaism', 'parsha', 'dvar', 'talmud', 'mitzvah'],
      inspiration: ['inspiration', 'motivate', 'encourage', 'uplift', 'spiritual'],
      podcast: ['podcast', 'episode', 'interview', 'conversation', 'talk', 'discussion'],
      education: ['education', 'learn', 'teach', 'school', 'lesson', 'tutorial', 'guide'],
      entertainment: ['entertainment', 'funny', 'comedy', 'humor', 'joke', 'laugh']
    };
    
    // Convert inputs to lowercase for case-insensitive matching
    const combinedText = `${title} ${description}`.toLowerCase();
    
    // Count keyword matches for each category
    const matches = Object.entries(categoryKeywords).map(([category, keywords]) => {
      const matchCount = keywords.filter(keyword => combinedText.includes(keyword)).length;
      return { category, matchCount };
    });
    
    // Find category with most matches
    matches.sort((a, b) => b.matchCount - a.matchCount);
    
    // If no matches found, use 'other' category
    const category = matches[0].matchCount > 0 ? matches[0].category : 'other';

    return new Response(JSON.stringify({ category }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
