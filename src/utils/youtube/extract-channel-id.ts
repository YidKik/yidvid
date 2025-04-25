
export const extractChannelId = (input: string): string => {
  let channelId = input.trim();
  
  // Handle full URLs
  if (channelId.includes('youtube.com/')) {
    // Handle channel URLs with channel ID
    const channelMatch = channelId.match(/youtube\.com\/(?:channel\/)([\w-]+)/);
    if (channelMatch && channelMatch[1]) {
      return channelMatch[1];
    }
    
    // Handle custom URLs with @ format
    const customUrlMatch = channelId.match(/youtube\.com\/(@[\w-]+)/);
    if (customUrlMatch && customUrlMatch[1]) {
      return customUrlMatch[1]; // Return with @ symbol for the edge function
    }
    
    // Handle c/ format URLs
    const cFormatMatch = channelId.match(/youtube\.com\/c\/([\w-]+)/);
    if (cFormatMatch && cFormatMatch[1]) {
      return cFormatMatch[1];
    }
  } else if (channelId.startsWith('@')) {
    // Handle @username format
    return channelId; // Return including @ symbol for the edge function
  }
  
  return channelId;
};
