
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting text-to-speech request...');
    
    // First, create a speech synthesis task
    const ASSEMBLY_AI_API_KEY = Deno.env.get('ASSEMBLY_AI_API_KEY');
    if (!ASSEMBLY_AI_API_KEY) {
      throw new Error('AssemblyAI API key not configured');
    }

    const createResponse = await fetch(
      'https://api.assemblyai.com/v3/speech-synthesis',
      {
        method: 'POST',
        headers: {
          'Authorization': ASSEMBLY_AI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: "Hi! How can I help you today?",
          voice: "echo", // Using Echo voice, a friendly and clear voice
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Failed to create speech:', errorText);
      throw new Error(`Failed to create speech: ${createResponse.statusText}`);
    }

    const { id } = await createResponse.json();
    console.log('Speech synthesis task created with ID:', id);

    // Poll until the audio is ready
    let audioUrl = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!audioUrl && attempts < maxAttempts) {
      console.log(`Checking speech status (attempt ${attempts + 1}/${maxAttempts})...`);
      
      const checkResponse = await fetch(
        `https://api.assemblyai.com/v3/speech-synthesis/${id}`,
        {
          headers: {
            'Authorization': ASSEMBLY_AI_API_KEY,
          },
        }
      );

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        console.error('Failed to check speech status:', errorText);
        throw new Error(`Failed to check speech status: ${checkResponse.statusText}`);
      }

      const status = await checkResponse.json();
      console.log('Speech status:', status);
      
      if (status.status === 'completed') {
        audioUrl = status.audio_url;
      } else if (status.status === 'error') {
        throw new Error('Speech synthesis failed');
      } else {
        // Wait a bit before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    if (!audioUrl) {
      throw new Error('Timed out waiting for audio');
    }

    console.log('Audio URL received:', audioUrl);

    // Fetch the audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('Failed to fetch audio:', errorText);
      throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('Audio successfully processed and converted to base64');

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
