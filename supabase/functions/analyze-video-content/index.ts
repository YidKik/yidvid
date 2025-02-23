
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { title, description, thumbnail } = await req.json()
    console.log('Analyzing content:', { title, description })

    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))

    // Analyze text content (title and description)
    const textAnalysis = await hf.textClassification({
      model: 'michellejieli/inappropriate_text_classifier',
      inputs: `${title}\n${description}`,
    })

    // Also analyze for women/ladies mentions
    const womenMentions = (title + description).toLowerCase().includes('women') || 
                         (title + description).toLowerCase().includes('lady') ||
                         (title + description).toLowerCase().includes('ladies') ||
                         (title + description).toLowerCase().includes('female')

    // For image analysis, we'll use a pre-trained model
    let imageAnalysis = null
    if (thumbnail) {
      try {
        const imageClassification = await hf.imageClassification({
          model: 'Falconsai/nsfw_image_detection',  // Safe for work classifier
          data: await (await fetch(thumbnail)).blob(),
        })
        imageAnalysis = imageClassification
      } catch (error) {
        console.error('Error analyzing image:', error)
        // Continue without image analysis if it fails
      }
    }

    // Determine if content is appropriate
    const isTextSafe = textAnalysis[0].label === 'appropriate' && !womenMentions
    const isImageSafe = !imageAnalysis || 
                       (imageAnalysis[0].label === 'safe' && 
                        imageAnalysis[0].score > 0.7)

    const isApproved = isTextSafe && isImageSafe

    // Prepare detailed response
    const response = {
      approved: isApproved,
      textAnalysis: {
        appropriate: textAnalysis[0].label === 'appropriate',
        noWomenMentions: !womenMentions,
        score: textAnalysis[0].score
      },
      imageAnalysis: imageAnalysis ? {
        appropriate: imageAnalysis[0].label === 'safe',
        score: imageAnalysis[0].score
      } : 'No image analysis performed'
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
