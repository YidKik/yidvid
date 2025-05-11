
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
   * and proper error handling
   */
  const handleSignIn = async (credentials: AuthCredentials) => {
    try {
      setIsLoading(true);
      setLoginError("");
      
      // Validate that email and password are provided
      if (!credentials.email?.trim() || !credentials.password?.trim()) {
        setLoginError("Please enter both email and password");
        setIsLoading(false);
        return false;
      }
      
      // Call the authentication handler
      const result = await signIn(credentials);
      
      // Only trigger success callback if login was successful
      if (result) {
        if (onSuccess) onSuccess();
        return true;
      } else {
        // If signIn returned false but no error was set, set a generic error
        if (!loginError) {
          setLoginError("Invalid email or password");
        }
        return false;
      }
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
