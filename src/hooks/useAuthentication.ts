
import { useAuthBase } from "./auth/useAuthBase";
import { useAuthSignIn } from "./auth/useAuthSignIn";
import { useAuthSignUp } from "./auth/useAuthSignUp";
import { useAuthSignOut } from "./auth/useAuthSignOut";
import { useAuthPasswordReset } from "./auth/useAuthPasswordReset";

export type { AuthCredentials, AuthOptions } from "./auth/useAuthSignIn";

/**
 * Main authentication hook that composes all authentication functionality
 * This hook orchestrates the various specialized authentication hooks
 * to provide a unified interface for authentication operations
 */
export const useAuthentication = () => {
  const baseAuth = useAuthBase();
  const { signIn } = useAuthSignIn();
  const { signUp } = useAuthSignUp();
  const { signOut } = useAuthSignOut();
  const { resetPassword, updatePassword, isPasswordResetSent } = useAuthPasswordReset();

  return {
    // Auth state
    session: baseAuth.session,
    isAuthenticated: baseAuth.isAuthenticated,
    isLoading: baseAuth.isLoading,
    isLoggingOut: baseAuth.isLoggingOut,
    authError: baseAuth.authError,
    isPasswordResetSent,
    
    // Auth methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearErrors: baseAuth.clearErrors,
    setAuthError: baseAuth.setAuthError
  };
};
