
const APP_NAME = "YidVid";
const APP_DESCRIPTION = "Your source for Jewish content - Access curated Jewish videos and music from trusted sources";

export const getPageTitle = (path: string): string => {
  // Remove leading slash and split path into segments
  const segments = path.replace(/^\//, '').split('/');
  
  // Handle root path
  if (segments[0] === '') return `Home | ${APP_NAME} - Jewish Content Platform`;
  
  // Map route segments to readable titles
  const pageTitles: { [key: string]: string | { [key: string]: string } } = {
    'video': 'Watch Video',
    'channel': 'Channel',
    'dashboard': 'My Dashboard',
    'settings': 'Account Settings',
    'music': 'Music Player',
    'search': 'Search Results',
    'category': 'Category Videos',
    'auth': 'Sign In',
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
    return `${baseTitle} | ${APP_NAME}`;
  }
  
  return `${baseTitle} | ${APP_NAME}`;
};

// Enhanced SEO metadata
export const DEFAULT_META_DESCRIPTION = APP_DESCRIPTION;
export const DEFAULT_META_KEYWORDS = "Jewish videos, Jewish content, Torah videos, Jewish music, Jewish lectures, Jewish education, Jewish media";
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
