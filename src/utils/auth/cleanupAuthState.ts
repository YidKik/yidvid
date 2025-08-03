/**
 * Comprehensive auth state cleanup utility to prevent authentication limbo states
 */
export const cleanupAuthState = () => {
  console.log("Cleaning up authentication state...");
  
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Clean up insecure admin bypass methods
  localStorage.removeItem('admin-pin-bypass');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('admin-status-')) {
      console.log(`Removing insecure admin status key: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removing sessionStorage key: ${key}`);
      sessionStorage.removeItem(key);
    }
  });
  
  console.log("Auth state cleanup completed");
};

/**
 * Enhanced sign out function with proper cleanup
 */
export const secureSignOut = async (supabaseClient: any, navigate?: (path: string) => void) => {
  try {
    console.log("Starting secure sign out process...");
    
    // Clean up state first
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabaseClient.auth.signOut({ scope: 'global' });
      console.log("Global sign out completed");
    } catch (err) {
      console.warn("Global sign out failed, continuing with cleanup:", err);
      // Continue even if this fails
    }
    
    // Navigate and force page reload for clean state
    if (navigate) {
      navigate('/auth');
    } else {
      window.location.href = '/auth';
    }
  } catch (error) {
    console.error("Sign out error:", error);
    // Force navigation even if sign out fails
    if (navigate) {
      navigate('/auth');
    } else {
      window.location.href = '/auth';
    }
  }
};