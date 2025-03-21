
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
    setLoginError(authError);
  }, [authError]);

  /**
   * Wrapper function for signIn that passes through the onSuccess callback
   */
  const handleSignIn = async (credentials: AuthCredentials) => {
    return await signIn(credentials, { onSuccess });
  };

  return {
    signIn: handleSignIn,
    isLoading,
    loginError,
    setLoginError: setAuthError
  };
};
