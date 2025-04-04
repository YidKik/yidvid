
/**
 * Utilities for managing scroll restoration during navigation
 */

// Save the current scroll position for a specific path
export const saveScrollPosition = (path: string) => {
  try {
    const scrollPositions = JSON.parse(sessionStorage.getItem('scrollPositions') || '{}');
    scrollPositions[path] = window.scrollY;
    sessionStorage.setItem('scrollPositions', JSON.stringify(scrollPositions));
  } catch (e) {
    console.warn('Could not save scroll position:', e);
  }
};

// Retrieve saved scroll position for a path
export const getScrollPosition = (path: string): number => {
  try {
    const scrollPositions = JSON.parse(sessionStorage.getItem('scrollPositions') || '{}');
    return scrollPositions[path] || 0;
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
      history.push(path);
      sessionStorage.setItem('navigationHistory', JSON.stringify(history));
    }
    
    // Also save current scroll position for this path
    saveScrollPosition(path);
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
      return history[history.length - 2];
    }
    return null;
  } catch (e) {
    console.warn('Could not get previous path:', e);
    return null;
  }
};

// Update the App component to track all route changes
export const setupScrollRestoration = () => {
  // Track initial page load
  recordNavigation(window.location.pathname);
  
  // Listen for route changes to save scroll positions
  window.addEventListener('beforeunload', () => {
    saveScrollPosition(window.location.pathname);
  });
};
