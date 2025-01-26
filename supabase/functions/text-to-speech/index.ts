import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY')
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL" // Sarah voice

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY!,
        },
        body: JSON.stringify({
          text: "Hi! How can I help you today?",
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.statusText}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})