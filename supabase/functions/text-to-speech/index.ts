
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to implement exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const exponentialBackoff = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json();
    console.log('Starting text-to-speech request with Play.ht...');
    console.log('Input text:', text);
    
    const PLAY_HT_API_KEY = Deno.env.get('PLAY_HT_API_KEY');
    const PLAY_HT_USER_ID = Deno.env.get('PLAY_HT_USER_ID');
    
    if (!PLAY_HT_API_KEY || !PLAY_HT_USER_ID) {
      throw new Error('Play.ht credentials not configured');
    }

    // First, create a generation request
    let createResponse;
    let createAttempts = 0;
    const maxCreateAttempts = 5;

    while (createAttempts < maxCreateAttempts) {
      console.log(`Attempting to create speech (attempt ${createAttempts + 1}/${maxCreateAttempts})...`);
      
      createResponse = await fetch(
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

      if (createResponse.status === 429) {
        // Rate limited - wait with exponential backoff
        const waitTime = exponentialBackoff(createAttempts);
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
        createAttempts++;
      } else if (!createResponse.ok) {
        const errorData = await createResponse.text();
        console.error('Failed to create speech. Status:', createResponse.status);
        console.error('Error response:', errorData);
        throw new Error(`Failed to create speech: ${createResponse.status} - ${errorData}`);
      } else {
        break;
      }
    }

    if (!createResponse || !createResponse.ok) {
      throw new Error('Failed to create speech after maximum retries');
    }

    const createData = await createResponse.json();
    console.log('Speech generation response:', createData);
    
    const { id } = createData;
    if (!id) {
      throw new Error('No generation ID received from Play.ht');
    }

    console.log('Speech generation task created with ID:', id);

    // Poll until the audio is ready with rate limit handling
    let audioUrl = null;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!audioUrl && attempts < maxAttempts) {
      console.log(`Checking speech status (attempt ${attempts + 1}/${maxAttempts})...`);
      
      try {
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

        if (checkResponse.status === 429) {
          // Rate limited - wait with exponential backoff
          const waitTime = exponentialBackoff(attempts);
          console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
          attempts++;
          continue;
        }

        if (!checkResponse.ok) {
          const errorData = await checkResponse.text();
          console.error('Failed to check speech status:', errorData);
          throw new Error(`Failed to check speech status: ${checkResponse.status} - ${errorData}`);
        }

        const status = await checkResponse.json();
        console.log('Speech status:', status);
        
        if (status.converted) {
          audioUrl = status.url;
          break;
        } else if (status.error) {
          throw new Error(`Speech synthesis failed: ${status.error}`);
        }
      } catch (error) {
        if (error.message.includes('Rate limit')) {
          const waitTime = exponentialBackoff(attempts);
          console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
        } else {
          throw error;
        }
      }

      // Standard delay between status checks
      await delay(2000); // Increased from 1s to 2s
      attempts++;
    }

    if (!audioUrl) {
      throw new Error('Timed out waiting for audio generation');
    }

    console.log('Audio URL received:', audioUrl);

    // Fetch the audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      const errorData = await audioResponse.text();
      console.error('Failed to fetch audio:', errorData);
      throw new Error(`Failed to fetch audio: ${audioResponse.status} - ${errorData}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('Audio successfully processed and converted to base64');

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
