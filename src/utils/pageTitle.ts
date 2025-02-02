const APP_NAME = "YidVid";

export const getPageTitle = (path: string): string => {
  // Remove leading slash and split path into segments
  const segments = path.replace(/^\//, '').split('/');
  
  // Handle root path
  if (segments[0] === '') return `${APP_NAME} - Jewish Video Portal`;
  
  // Map route segments to readable titles
  const pageTitles: { [key: string]: string } = {
    'video': 'Video Player',
    'channel': 'Channel',
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'music': 'Music',
    'search': 'Search Results'
  };
  
  // Get the base page title
  const baseTitle = pageTitles[segments[0]] || segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  
  return `${baseTitle} | ${APP_NAME}`;
};