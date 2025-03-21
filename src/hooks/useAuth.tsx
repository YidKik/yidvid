
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
    signOut: handleLogout
  } = useAuthentication();

  return {
    session,
    isAuthenticated,
    handleLogout,
    isLoggingOut
  };
};
