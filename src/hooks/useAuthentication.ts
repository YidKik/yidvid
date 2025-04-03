
import { useAuthBase } from "./auth/useAuthBase";
import { useAuthSignIn } from "./auth/useAuthSignIn";
import { useAuthSignUp } from "./auth/useAuthSignUp";
import { useAuthSignOut } from "./auth/useAuthSignOut";
import { useAuthPasswordReset } from "./auth/useAuthPasswordReset";
import { prefetchUserData } from "@/utils/userDataPrefetch";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  // Additional admin check function
  const checkAndCacheAdminStatus = async (userId: string) => {
    if (!userId) return;
    
    try {
      console.log("Explicitly checking admin status after authentication for user:", userId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking admin status in useAuthentication:", error);
        return;
      }
      
      const isAdmin = data?.is_admin === true;
      console.log("Admin status check result:", isAdmin);
      
      if (isAdmin) {
        // Set in query cache for future quick access
        queryClient.setQueryData(
          ["admin-status", userId],
          { isAdmin: true }
        );
      }
    } catch (err) {
      console.error("Failed admin status check in useAuthentication:", err);
    }
  };

  // Ensure profile data is fetched when session changes
  useEffect(() => {
    if (baseAuth.session) {
      console.log("Session detected in useAuthentication, ensuring profile data is available");
      prefetchUserData(baseAuth.session, queryClient)
        .then(() => {
          console.log("Profile data refresh complete in useAuthentication");
          // Explicitly check admin status after profile data is fetched
          checkAndCacheAdminStatus(baseAuth.session.user.id);
        })
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
        const result = await signIn(credentials, options);
        
        // Explicitly check admin status right after successful login
        if (result) {
          // Move the null check outside of the conditional to ensure result is not null
          // when we try to access its properties
          const resultObj = result;
          
          // Now safely use resultObj which TypeScript knows is not null
          if (
            typeof resultObj === 'object' && 
            'user' in resultObj && 
            resultObj.user !== null && 
            'id' in resultObj.user && 
            typeof resultObj.user.id === 'string'
          ) {
            // Use a safer timeout approach with proper typing
            const userId = resultObj.user.id;
            setTimeout(() => {
              checkAndCacheAdminStatus(userId);
            }, 500); // Small delay to allow other auth processes to complete
          }
        }
        
        return result;
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
