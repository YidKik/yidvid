
/**
 * Process the response from the YouTube edge function
 */
export const processYouTubeFetchResponse = (
  response: any,
  setFetchAttempts: (value: number | ((prev: number) => number)) => void,
  setLastSuccessfulFetch: (value: Date | null) => void
): { success: boolean; message?: string } => {
  if (response?.success) {
    console.log(`Successfully processed ${response.processed} channels, found ${response.newVideos} new videos`);
    setFetchAttempts(0);
    setLastSuccessfulFetch(new Date());
    
    if (response.newVideos > 0) {
      console.log(`Found ${response.newVideos} new videos`);
    } else {
      console.log("No new videos found");
    }
    
    return { success: true };
  } else if (response?.quota_reset_at) {
    const resetTime = new Date(response.quota_reset_at);
    const message = `YouTube quota limited. Full service will resume at ${resetTime.toLocaleString()}`;
    console.log(message);
    return { success: false, message };
  } else if (response?.message) {
    console.error(response.message);
    return { success: false, message: response.message };
  }
  
  return { success: false, message: "Unknown error fetching videos" };
}
