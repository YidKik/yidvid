
const APP_NAME = "YidVid";

export const getPageTitle = (path: string): string => {
  // Remove leading slash and split path into segments
  const segments = path.replace(/^\//, '').split('/');
  
  // Handle root path
  if (segments[0] === '') return `Home | ${APP_NAME}`;
  
  // Map route segments to readable titles
  const pageTitles: { [key: string]: string } = {
    'video': 'Video Player',
    'channel': 'Channel Details',
    'dashboard': 'Admin Dashboard',
    'settings': 'User Settings',
    'music': 'Music Player',
    'search': 'Search Results'
  };
  
  // Get the base page title
  const baseTitle = pageTitles[segments[0]] || segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  
  // If there's an ID in the URL, try to make the title more descriptive
  if (segments[1]) {
    return `${baseTitle} | ${APP_NAME}`;
  }
  
  return `${baseTitle} | ${APP_NAME}`;
};
