
import { useUnifiedAuth } from "./useUnifiedAuth";

/**
 * Simplified authentication hook that provides basic auth state
 * Uses the unified authentication system as the single source of truth
 */
export const useAuth = () => {
  const auth = useUnifiedAuth();
  
  return {
    session: auth.session,
    user: auth.user,
    profile: auth.profile,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    isProfileLoading: auth.isProfileLoading,
    handleLogout: auth.signOut,
    isLoggingOut: auth.isLoading && !auth.session,
    error: auth.error
  };
};
