
export const extractChannelId = (input: string): string => {
  let channelId = input.trim();
  
  // Remove /videos or any path segments after the channel ID
  channelId = channelId.replace(/\/(videos|featured|playlists|community|channels|about).*$/i, '');
  
  // Decode URL encoding
  try {
    channelId = decodeURIComponent(channelId);
  } catch (e) {
    // If decoding fails, continue with original
  }
  
  // Handle full URLs
  if (channelId.includes('youtube.com/')) {
    // Handle channel URLs with channel ID format (UC...)
    const channelMatch = channelId.match(/youtube\.com\/(?:channel\/)(UC[\w-]+)/i);
    if (channelMatch && channelMatch[1]) {
      return channelMatch[1];
    }
    
    // Handle custom URLs with @ format
    const customUrlMatch = channelId.match(/youtube\.com\/(@[\w-]+)/);
    if (customUrlMatch && customUrlMatch[1]) {
      // The @ handle needs to be resolved to a channel ID via API
      return customUrlMatch[1];
    }
    
    // Handle c/ format URLs
    const cFormatMatch = channelId.match(/youtube\.com\/c\/([\w-]+)/);
    if (cFormatMatch && cFormatMatch[1]) {
      // The custom URL needs to be resolved to a channel ID via API
      return cFormatMatch[1];
    }

    // Handle user/ format URLs
    const userFormatMatch = channelId.match(/youtube\.com\/user\/([\w-]+)/);
    if (userFormatMatch && userFormatMatch[1]) {
      // The username needs to be resolved to a channel ID via API
      return userFormatMatch[1];
    }
  }
  
  // Extract UC channel ID even if there's junk after it
  const ucMatch = channelId.match(/(UC[\w-]{22})/i);
  if (ucMatch && ucMatch[1]) {
    return ucMatch[1];
  }
  
  // Handle @username format
  if (channelId.startsWith('@')) {
    return channelId; // Return including @ symbol for the edge function to resolve
  }
  
  return channelId;
};
