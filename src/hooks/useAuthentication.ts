
import { useAuthBase } from "./auth/useAuthBase";
import { useAuthSignIn } from "./auth/useAuthSignIn";
import { useAuthSignUp } from "./auth/useAuthSignUp";
import { useAuthSignOut } from "./auth/useAuthSignOut";
import { useAuthPasswordReset } from "./auth/useAuthPasswordReset";
import { prefetchUserData } from "@/utils/userDataPrefetch";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

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
  const queryClient = useQueryClient();

  // Ensure profile data is fetched when session changes
  useEffect(() => {
    if (baseAuth.session) {
      console.log("Session detected in useAuthentication, ensuring profile data is available");
      prefetchUserData(baseAuth.session, queryClient)
        .then(() => console.log("Profile data refresh complete in useAuthentication"))
        .catch(err => console.error("Failed to refresh profile data in useAuthentication:", err));
    }
  }, [baseAuth.session, queryClient]);

  return {
    // Auth state
    session: baseAuth.session,
    isAuthenticated: baseAuth.isAuthenticated,
    isLoading: baseAuth.isLoading,
    isLoggingOut: baseAuth.isLoggingOut,
    authError: baseAuth.authError,
    isPasswordResetSent,
    
    // Auth methods
    signIn: async (credentials, options) => {
      try {
        baseAuth.clearErrors();
        return await signIn(credentials, options);
      } catch (error) {
        console.error("Authentication error in useAuthentication:", error);
        throw error; // Re-throw to allow for proper error handling upstream
      }
    },
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearErrors: baseAuth.clearErrors,
    setAuthError: baseAuth.setAuthError
  };
};
