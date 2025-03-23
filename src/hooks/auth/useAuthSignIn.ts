
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateSignInForm } from "@/utils/formValidation";
import { useAuthBase } from "./useAuthBase";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook that handles user sign-in functionality
 * Depends on useAuthBase for shared authentication state
 */
export const useAuthSignIn = () => {
  const {
    navigate,
    queryClient,
    isLoading,
    setIsLoading,
    setAuthError,
    prefetchUserData
  } = useAuthBase();

  /**
   * Handles user sign-in with email and password
   * 
   * @param credentials - User credentials (email and password)
   * @param options - Optional configuration for redirect and callbacks
   * @returns Promise resolving to boolean indicating success/failure
   */
  const signIn = useCallback(async (credentials: AuthCredentials, options?: AuthOptions) => {
    const { email, password } = credentials;
    
    // Validate form inputs before attempting sign-in
    const validation = validateSignInForm(email, password);
    if (!validation.valid) {
      setAuthError(validation.message || "Invalid form data");
      return false;
    }

    setAuthError("");
    setIsLoading(true);

    try {
      console.log("Attempting to sign in with email:", email);
      
      // Attempt authentication with Supabase using password method
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        
        // Provide more user-friendly error for common authentication failure
        if (signInError.message === "Invalid login credentials") {
          setAuthError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setAuthError(signInError.message || "Error during sign in");
        }
        
        if (options?.onError) {
          options.onError(signInError.message);
        }
        
        setIsLoading(false);
        return false;
      }

      if (signInData?.user) {
        console.log("User signed in successfully:", signInData.user.email);
        
        // Clear stale user data from cache to ensure fresh data is loaded
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["user-profile"] });
        
        try {
          // Prefetch user data for improved performance
          await prefetchUserData(signInData.user.id);
          
          // Execute success callback if provided
          if (options?.onSuccess) {
            options.onSuccess();
          }
          
          // Navigate based on redirectTo option or default to home
          if (options?.redirectTo) {
            navigate(options.redirectTo);
          }
        } catch (prefetchError) {
          // Prefetch failure should not prevent successful login
          console.error("Error prefetching user data:", prefetchError);
        }
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error("Sign in error:", error);
      const errorMessage = "An unexpected error occurred during sign in. Please try again.";
      setAuthError(errorMessage);
      
      if (options?.onError) {
        options.onError(errorMessage);
      }
      
      setIsLoading(false);
      return false;
    }
  }, [navigate, prefetchUserData, queryClient, setAuthError, setIsLoading]);

  return { signIn };
};
