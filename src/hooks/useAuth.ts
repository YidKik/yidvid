
import { useAuthentication } from "./useAuthentication";

/**
 * Simplified authentication hook for components that only need
 * basic authentication state and logout functionality
 */
export const useAuth = () => {
  const {
    user,
    session,
    isAuthenticated,
    isLoggingOut,
    signOut,
    isLoading
  } = useAuthentication();

  // Provide a consistent logout handler
  const handleLogout = async () => {
    await signOut();
    return Promise.resolve();
  };

  return {
    user,
    session,
    isAuthenticated,
    handleLogout,
    isLoggingOut,
    isLoading
  };
};
