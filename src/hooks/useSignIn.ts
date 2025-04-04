
import { useState, useEffect } from "react";
import { useAuthentication } from "./useAuthentication";
import type { AuthCredentials } from "./useAuthentication";

export type { AuthCredentials } from "./useAuthentication";

interface UseSignInProps {
  onSuccess?: () => void;
}

/**
 * Hook that provides a simplified interface for sign-in functionality
 * Wraps useAuthentication to focus specifically on the sign-in process
 * with local state management for loading and errors
 */
export const useSignIn = ({ onSuccess }: UseSignInProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const { 
    signIn, 
    isLoading: authLoading, 
    authError, 
    setAuthError 
  } = useAuthentication();

  // Sync loading state with authentication hook
  useEffect(() => {
    setIsLoading(authLoading);
  }, [authLoading]);
  
  // Sync error state with authentication hook
  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  /**
   * Wrapper function for signIn that passes through the onSuccess callback
   */
  const handleSignIn = async (credentials: AuthCredentials) => {
    try {
      setIsLoading(true);
      setLoginError("");
      const result = await signIn(credentials, { onSuccess });
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || "Sign in failed. Please try again.";
      setLoginError(errorMessage);
      return false;
    } finally {
      // We don't need to setIsLoading(false) here as it should be synced from authLoading
    }
  };

  return {
    signIn: handleSignIn,
    isLoading,
    loginError,
    setLoginError: (error: string) => {
      setLoginError(error);
      setAuthError(error);
    }
  };
};
