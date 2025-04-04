
import { useAuthentication } from "./useAuthentication";

/**
 * Simplified authentication hook for components that only need
 * basic authentication state and logout functionality
 */
export const useAuth = () => {
  const auth = useAuthentication();
  
  return {
    session: auth.user,
    isAuthenticated: !!auth.user,
    handleLogout: auth.signOut,
    isLoggingOut: auth.isLoading && !auth.user,
    isLoading: auth.isLoading
  };
};
