
export const extractChannelId = (input: string): string => {
  let channelId = input.trim();
  
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
  
  // Handle direct UC... channel IDs
  if (/^UC[\w-]{22}$/i.test(channelId)) {
    return channelId;
  }
  
  // Handle @username format
  if (channelId.startsWith('@')) {
    return channelId; // Return including @ symbol for the edge function to resolve
  }
  
  return channelId;
};
