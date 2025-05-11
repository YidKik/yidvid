
const APP_NAME = "YidVid";
const APP_DESCRIPTION = "Your source for Jewish content - Access curated Jewish videos and music from trusted sources";

export const getPageTitle = (path: string): string => {
  // Remove leading slash and split path into segments
  const segments = path.replace(/^\//, '').split('/');
  
  // Handle root path
  if (segments[0] === '') return `Home | ${APP_NAME} - Jewish Content Platform`;
  
  // Map route segments to readable titles with improved SEO keywords
  const pageTitles: { [key: string]: string | { [key: string]: string } } = {
    'video': 'Watch Jewish Video',
    'channel': 'Jewish Channel',
    'dashboard': 'My Dashboard',
    'settings': 'Account Settings',
    'music': 'Jewish Music Player',
    'search': 'Search Jewish Videos & Content',
    'category': 'Jewish Video Categories',
    'auth': 'Sign In to YidVid',
    'admin': {
      'channels': 'Channel Management',
      'comments': 'Comment Management',
      'requests': 'Channel Requests',
      'users': 'User Management',
      'analytics': 'Analytics Dashboard',
      'videos': 'Video Management',
      'categories': 'Category Management',
      'contact-requests': 'Contact Requests',
      'reported-videos': 'Reported Videos',
      'notifications': 'Global Notifications'
    }
  };
  
  // Handle admin routes specially
  if (segments[0] === 'admin' && segments[1]) {
    const adminTitle = (pageTitles['admin'] as { [key: string]: string })[segments[1]];
    return adminTitle ? `${adminTitle} | ${APP_NAME} Admin` : `Admin | ${APP_NAME}`;
  }
  
  // Get the base page title
  const baseTitle = typeof pageTitles[segments[0]] === 'string' 
    ? pageTitles[segments[0]] 
    : segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  
  // If there's an ID in the URL, try to make the title more descriptive
  if (segments[1]) {
    return `${baseTitle} | ${APP_NAME} - Jewish Content Platform`;
  }
  
  return `${baseTitle} | ${APP_NAME} - Jewish Content Platform`;
};

// Enhanced SEO metadata
export const DEFAULT_META_DESCRIPTION = APP_DESCRIPTION + " - Find Jewish lectures, Torah videos, kosher music, Yiddish videos, and more religious content.";
export const DEFAULT_META_KEYWORDS = "Jewish videos, Jewish content, Torah videos, Jewish music, Jewish lectures, Jewish education, Jewish media, Yiddish videos, kosher content, religious videos, Jewish channels";
export const DEFAULT_META_IMAGE = "/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png"; // Updated to use the official logo

// New SEO utility functions
export const getSEOConfig = (path: string, customConfig?: {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}) => {
  return {
    title: customConfig?.title || getPageTitle(path),
    description: customConfig?.description || DEFAULT_META_DESCRIPTION,
    keywords: customConfig?.keywords || DEFAULT_META_KEYWORDS,
    image: customConfig?.image || DEFAULT_META_IMAGE,
    url: window.location.href,
    siteName: APP_NAME,
    type: path.includes('video/') ? 'video.other' : 'website'
  };
};

// New function to generate structured data for rich search results
export const generateVideoStructuredData = (video: any) => {
  if (!video) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description || `${video.title} - Jewish video content from ${video.channel_name}`,
    "thumbnailUrl": video.thumbnail,
    "uploadDate": video.uploaded_at || new Date().toISOString(),
    "contentUrl": `https://yidvid.com/video/${video.id}`,
    "embedUrl": `https://www.youtube.com/embed/${video.video_id}`,
    "author": {
      "@type": "Person",
      "name": video.channel_name
    }
  };
};

// Generate channel structured data
export const generateChannelStructuredData = (channel: any) => {
  if (!channel) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": channel.title,
    "description": channel.description || `Jewish content creator: ${channel.title}`,
    "image": channel.thumbnail_url,
    "url": `https://yidvid.com/channel/${channel.channel_id}`
  };
};
