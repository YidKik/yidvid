
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
    console.log('Analyzing content:', { title, description })

    // Simple rule-based content checking (no AI)
    const forbiddenWords = ['inappropriate', 'obscene', 'offensive', 'explicit'];
    const sensitiveTerms = ['women', 'lady', 'ladies', 'female'];
    
    // Check if title or description contains any forbidden words
    const lowercaseTitle = (title || '').toLowerCase();
    const lowercaseDesc = (description || '').toLowerCase();
    
    const hasForbiddenWords = forbiddenWords.some(word => 
      lowercaseTitle.includes(word) || lowercaseDesc.includes(word)
    );
    
    const hasSensitiveTerms = sensitiveTerms.some(term => 
      lowercaseTitle.includes(term) || lowercaseDesc.includes(term)
    );
    
    const isApproved = !hasForbiddenWords && !hasSensitiveTerms;

    // Prepare response
    const response = {
      approved: isApproved,
      textAnalysis: {
        appropriate: !hasForbiddenWords,
        noWomenMentions: !hasSensitiveTerms,
        score: isApproved ? 0.9 : 0.3
      },
      imageAnalysis: 'No image analysis performed'
    }

    console.log('Analysis result:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in analyze-video-content:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
