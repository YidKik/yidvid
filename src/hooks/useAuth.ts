
import { useAuthentication } from "./useAuthentication";

/**
 * Simplified authentication hook for components that only need
 * basic authentication state and logout functionality
 */
export const useAuth = () => {
  const {
    session,
    isAuthenticated,
    isLoggingOut,
    signOut,
    isLoading
  } = useAuthentication();

  return {
    session,
    isAuthenticated,
    handleLogout: signOut,
    isLoggingOut,
    isLoading
  };
};
