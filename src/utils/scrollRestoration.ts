/**
 * Utilities for managing scroll restoration during navigation
 */

// Save the current scroll position for a specific path
export const saveScrollPosition = (path: string) => {
  try {
    const scrollPositions = JSON.parse(sessionStorage.getItem('scrollPositions') || '{}');
    scrollPositions[path] = window.scrollY;
    sessionStorage.setItem('scrollPositions', JSON.stringify(scrollPositions));
    console.log(`Saved scroll position for ${path}: ${window.scrollY}px`);
  } catch (e) {
    console.warn('Could not save scroll position:', e);
  }
};

// Retrieve saved scroll position for a path
export const getScrollPosition = (path: string): number => {
  try {
    const scrollPositions = JSON.parse(sessionStorage.getItem('scrollPositions') || '{}');
    const position = scrollPositions[path] || 0;
    console.log(`Retrieved scroll position for ${path}: ${position}px`);
    return position;
  } catch (e) {
    console.warn('Could not retrieve scroll position:', e);
    return 0;
  }
};

// Record navigation history
export const recordNavigation = (path: string) => {
  try {
    const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    
    // Only add to history if this is a new page visit (not a back navigation)
    if (history.length === 0 || history[history.length - 1] !== path) {
      // Save current scroll position for the previous path before recording new path
      if (history.length > 0) {
        saveScrollPosition(history[history.length - 1]);
      }
      
      history.push(path);
      sessionStorage.setItem('navigationHistory', JSON.stringify(history));
      console.log(`Recorded navigation to: ${path}, history:`, history);
    }
  } catch (e) {
    console.warn('Could not record navigation:', e);
  }
};

// Get the previous path from navigation history
export const getPreviousPath = (): string | null => {
  try {
    const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    
    if (history.length > 1) {
      // Return second-to-last item (previous page)
      const previousPath = history[history.length - 2];
      console.log(`Retrieved previous path: ${previousPath}`);
      return previousPath;
    }
    return null;
  } catch (e) {
    console.warn('Could not get previous path:', e);
    return null;
  }
};

// Remove the current path from history when navigating back
export const removeCurrentPathFromHistory = () => {
  try {
    const history = JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
    
    if (history.length > 0) {
      // Remove last item (current page)
      history.pop();
      sessionStorage.setItem('navigationHistory', JSON.stringify(history));
      console.log(`Removed current path from history, new history:`, history);
    }
  } catch (e) {
    console.warn('Could not update navigation history:', e);
  }
};

// Check if the current route is the welcome page
export const isWelcomePage = (path: string) => {
  return path === '/' && !window.location.search.includes('skipWelcome=true');
};

// Update the App component to track all route changes
export const setupScrollRestoration = () => {
  // Track initial page load
  recordNavigation(window.location.pathname + window.location.search);
  
  // Listen for route changes to save scroll positions
  window.addEventListener('beforeunload', () => {
    saveScrollPosition(window.location.pathname + window.location.search);
  });
};
