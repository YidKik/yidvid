
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Always handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting text-to-speech request...');
    
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Content-Type must be application/json');
    }

    // Parse and validate request body
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid or missing text in request body');
    }

    console.log('Input text:', text);
    
    const PLAY_HT_API_KEY = Deno.env.get('PLAY_HT_API_KEY');
    const PLAY_HT_USER_ID = Deno.env.get('PLAY_HT_USER_ID');
    
    if (!PLAY_HT_API_KEY || !PLAY_HT_USER_ID) {
      throw new Error('Play.ht credentials not configured');
    }

    // Create generation request
    console.log('Creating speech generation request...');
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
          voice: 'larry',
          quality: 'medium',
          output_format: 'mp3',
          speed: 1,
          sample_rate: 24000,
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create speech generation: ${error}`);
    }

    const createData = await createResponse.json();
    console.log('Speech generation response:', createData);
    
    const { id } = createData;
    if (!id) {
      throw new Error('No generation ID received from Play.ht');
    }

    // Poll until the audio is ready with increased timeout
    let audioUrl = null;
    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = 2000; // 2 seconds
    
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
        const error = await checkResponse.text();
        throw new Error(`Failed to check speech status: ${error}`);
      }

      const status = await checkResponse.json();
      console.log('Speech status:', status);
      
      if (status.converted) {
        audioUrl = status.url;
        break;
      } else if (status.error) {
        throw new Error(`Speech synthesis failed: ${status.error}`);
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    if (!audioUrl) {
      throw new Error('Timed out waiting for audio generation');
    }

    // Fetch the audio file
    console.log('Fetching generated audio...');
    const audioResponse = await fetch(audioUrl);
    
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch generated audio file');
    }
    
    const audioBuffer = await audioResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('Audio successfully processed and converted to base64');

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

