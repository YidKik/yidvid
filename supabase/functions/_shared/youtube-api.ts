
import { corsHeaders } from './cors.ts'

export async function fetchYouTubeVideos(channelId: string, pageToken?: string) {
  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured')
  }

  const baseUrl = 'https://youtube.googleapis.com/youtube/v3/search'
  const params = new URLSearchParams({
    part: 'snippet',
    channelId: channelId,
    maxResults: '50',
    order: 'date',
    type: 'video',
    key: YOUTUBE_API_KEY,
  })

  if (pageToken) {
    params.append('pageToken', pageToken)
  }

  const response = await fetch(`${baseUrl}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`)
  }

  return response.json()
}

export function validateYouTubeResponse(data: any) {
  if (!data.items) {
    throw new Error('Invalid YouTube API response')
  }
  return data
}
