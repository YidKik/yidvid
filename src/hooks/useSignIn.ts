
import { useState, useEffect } from "react";
import { useAuthentication } from "./useAuthentication";

interface AuthCredentials {
  email: string;
  password: string;
}

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
    error: authError
  } = useAuthentication();

  // Sync loading state with authentication hook
  useEffect(() => {
    setIsLoading(authLoading);
  }, [authLoading]);
  
  // Sync error state with authentication hook
  useEffect(() => {
    if (authError) {
      setLoginError(authError.message || "Sign in failed");
    }
  }, [authError]);

  /**
   * Wrapper function for signIn that handles the onSuccess callback
   */
  const handleSignIn = async (credentials: AuthCredentials) => {
    try {
      setIsLoading(true);
      setLoginError("");
      await signIn(credentials);
      if (onSuccess) onSuccess();
      return true;
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
    setLoginError
  };
};
