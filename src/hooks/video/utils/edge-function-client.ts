
import { supabase } from "@/integrations/supabase/client";

/**
 * Call edge function to fetch new videos
 */
export const invokeYouTubeEdgeFunction = async (
  channelIds: string[],
  options: {
    forceUpdate: boolean;
    quotaConservative: boolean;
    prioritizeRecent: boolean;
    maxChannelsPerRun: number;
  }
): Promise<any> => {
  try {
    console.log(`Calling edge function to fetch new videos with ${options.forceUpdate ? 'HIGH' : 'normal'} priority...`);
    
    const { data: response, error: fetchError } = await supabase.functions.invoke('fetch-youtube-videos', {
      body: JSON.stringify({ 
        channels: channelIds,
        forceUpdate: options.forceUpdate,
        quotaConservative: options.quotaConservative,
        prioritizeRecent: options.prioritizeRecent,
        maxChannelsPerRun: options.maxChannelsPerRun
      })
    });

    if (fetchError) {
      console.error('Error invoking fetch-youtube-videos:', fetchError);
      return { success: false, message: fetchError.message };
    }
    
    console.log('Fetch response:', response);
    return response;
  } catch (edgeError) {
    console.error("Edge function connection error:", edgeError);
    return { success: false, message: "Connection error with video service" };
  }
}
