
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// export const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
//   'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
// };

// export const validateEnvironment = () => {
//   const apiKey = Deno.env.get('YOUTUBE_API_KEY');
//   if (!apiKey) {
//     console.error('[YouTube Videos] Missing YouTube API key');
//     throw new Error('YouTube API key not configured');
//   }
//   return apiKey;
// };

// export const createSupabaseClient = () => {
//   const supabaseUrl = Deno.env.get('SUPABASE_URL');
//   const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
//   if (!supabaseUrl || !supabaseServiceKey) {
//     console.error('[YouTube Videos] Missing Supabase credentials');
//     throw new Error('Supabase configuration missing');
//   }
  
//   return createClient(supabaseUrl, supabaseServiceKey);
// };

// export const handleError = (error: any) => {
//   console.error('[YouTube Videos] Error:', error);
  
//   let statusCode = 500;
//   let message = 'An internal server error occurred';
  
//   if (error.message?.includes('quota')) {
//     statusCode = 429;
//     message = 'YouTube API quota exceeded';
//   } else if (error.message?.includes('configuration')) {
//     statusCode = 503;
//     message = 'Service configuration error';
//   }
  
//   return new Response(
//     JSON.stringify({
//       success: false,
//       error: message,
//       details: error.message
//     }),
//     {
//       status: statusCode,
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' }
//     }
//   );
// };

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

export const validateEnvironment = () => {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  if (!apiKey) {
    console.error('[YouTube Videos] Missing YouTube API key');
    throw new Error('YouTube API key not configured');
  }
  return apiKey;
};

export const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[YouTube Videos] Missing Supabase credentials');
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

export const handleError = (error: any) => {
  console.error('[YouTube Videos] Error:', error);
  
  let statusCode = 500;
  let message = 'An internal server error occurred';
  
  if (error.message?.includes('quota')) {
    statusCode = 429;
    message = 'YouTube API quota exceeded';
  } else if (error.message?.includes('configuration')) {
    statusCode = 503;
    message = 'Service configuration error';
  }
  
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: error.message
    }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
};
