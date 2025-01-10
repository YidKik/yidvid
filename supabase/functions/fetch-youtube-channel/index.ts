import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

serve(async (req) => {
  const url = new URL(req.url);
  const channelId = url.searchParams.get('channelId');

  if (!channelId) {
    return new Response(
      JSON.stringify({ error: 'Channel ID is required' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Channel not found' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const channel = data.items[0].snippet;
    
    return new Response(
      JSON.stringify({
        title: channel.title,
        description: channel.description,
        thumbnailUrl: channel.thumbnails?.default?.url
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch channel details' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
});