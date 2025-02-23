
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, thumbnail } = await req.json();
    console.log('Analyzing video content:', { title, description });

    // First analyze text content
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a content moderator. Analyze the video title and description to determine if it contains or references inappropriate content or mentions women/ladies. Respond with only "APPROVED" or "REJECTED" followed by a brief reason.'
          },
          {
            role: 'user',
            content: `Title: ${title}\nDescription: ${description}`
          }
        ],
      }),
    });

    const textAnalysis = await response.json();
    const moderationResult = textAnalysis.choices[0].message.content;

    // Also analyze the thumbnail image if provided
    let imageAnalysisResult = "APPROVED";
    if (thumbnail) {
      const imageResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a content moderator. Analyze this image and determine if it contains women or inappropriate content. Respond with only "APPROVED" or "REJECTED" followed by a brief reason.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: thumbnail
                }
              ]
            }
          ],
        }),
      });

      const imageAnalysis = await imageResponse.json();
      imageAnalysisResult = imageAnalysis.choices[0].message.content;
    }

    const isApproved = moderationResult.startsWith('APPROVED') && imageAnalysisResult.startsWith('APPROVED');

    return new Response(JSON.stringify({
      approved: isApproved,
      textAnalysis: moderationResult,
      imageAnalysis: imageAnalysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-video-content:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
