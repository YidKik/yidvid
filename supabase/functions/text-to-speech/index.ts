
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
    const { text } = await req.json();
    console.log('Starting text-to-speech request with Play.ht...');
    
    const PLAY_HT_API_KEY = Deno.env.get('PLAY_HT_API_KEY');
    const PLAY_HT_USER_ID = Deno.env.get('PLAY_HT_USER_ID');
    
    if (!PLAY_HT_API_KEY || !PLAY_HT_USER_ID) {
      throw new Error('Play.ht credentials not configured');
    }

    // First, create a generation request
    const createResponse = await fetch(
      'https://api.play.ht/api/v2/tts',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PLAY_HT_API_KEY}`,
          'X-User-ID': PLAY_HT_USER_ID,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'en-US-JennyNeural',
          quality: 'draft',
          output_format: 'mp3',
          speed: 1,
          sample_rate: 24000,
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Failed to create speech:', errorText);
      throw new Error(`Failed to create speech: ${createResponse.statusText}`);
    }

    const { id } = await createResponse.json();
    console.log('Speech generation task created with ID:', id);

    // Poll until the audio is ready
    let audioUrl = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!audioUrl && attempts < maxAttempts) {
      console.log(`Checking speech status (attempt ${attempts + 1}/${maxAttempts})...`);
      
      const checkResponse = await fetch(
        `https://api.play.ht/api/v2/tts/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${PLAY_HT_API_KEY}`,
            'X-User-ID': PLAY_HT_USER_ID,
            'Accept': 'application/json',
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
      
      if (status.converted) {
        audioUrl = status.url;
      } else if (status.error) {
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

