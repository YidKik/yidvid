import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ASSEMBLY_AI_API_KEY = Deno.env.get('ASSEMBLY_AI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // First, create a speech synthesis task
    const createResponse = await fetch(
      'https://api.assemblyai.com/v3/speech-synthesis',
      {
        method: 'POST',
        headers: {
          'Authorization': ASSEMBLY_AI_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: "Hi! How can I help you today?",
          voice: "echo", // Using Echo voice, a friendly and clear voice
        }),
      }
    )

    if (!createResponse.ok) {
      throw new Error(`Failed to create speech: ${createResponse.statusText}`)
    }

    const { id } = await createResponse.json()

    // Poll until the audio is ready
    let audioUrl = null
    let attempts = 0
    const maxAttempts = 10

    while (!audioUrl && attempts < maxAttempts) {
      const checkResponse = await fetch(
        `https://api.assemblyai.com/v3/speech-synthesis/${id}`,
        {
          headers: {
            'Authorization': ASSEMBLY_AI_API_KEY!,
          },
        }
      )

      if (!checkResponse.ok) {
        throw new Error(`Failed to check speech status: ${checkResponse.statusText}`)
      }

      const status = await checkResponse.json()
      
      if (status.status === 'completed') {
        audioUrl = status.audio_url
      } else if (status.status === 'error') {
        throw new Error('Speech synthesis failed')
      } else {
        // Wait a bit before polling again
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      }
    }

    if (!audioUrl) {
      throw new Error('Timed out waiting for audio')
    }

    // Fetch the audio file
    const audioResponse = await fetch(audioUrl)
    const audioBuffer = await audioResponse.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})