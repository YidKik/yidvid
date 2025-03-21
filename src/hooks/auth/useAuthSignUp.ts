
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthBase } from "./useAuthBase";
import { AuthCredentials, AuthOptions } from "./useAuthSignIn";

/**
 * Hook that handles user sign-up functionality
 * Depends on useAuthBase for shared authentication state
 */
export const useAuthSignUp = () => {
  const {
    navigate,
    queryClient,
    setIsLoading,
    setAuthError,
    prefetchUserData
  } = useAuthBase();

  /**
   * Handles user registration with email and password
   * 
   * @param credentials - User credentials (email and password)
   * @param options - Optional configuration for redirect and callbacks
   * @returns Promise resolving to boolean indicating success/failure
   */
  const signUp = useCallback(async (credentials: AuthCredentials, options?: AuthOptions) => {
    const { email, password } = credentials;
    
    if (!email || !password) {
      const errorMessage = "Email and password are required";
      setAuthError(errorMessage);
      return false;
    }

    setAuthError("");
    setIsLoading(true);

    try {
      console.log("Attempting to sign up with email:", email);
      
      // Request account creation through Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error("Sign up error:", error);
        setAuthError(error.message);
        
        if (options?.onError) {
          options.onError(error.message);
        }
        
        return false;
      }

      console.log("Sign up response:", data);
      
      // Check if email confirmation is required
      // When identities array is empty, it means confirmation is needed
      const isEmailConfirmationSent = data?.user && data.user.identities && data.user.identities.length === 0;
      
      if (isEmailConfirmationSent) {
        // Handle case when email confirmation is required
        toast.success("Please check your email for a confirmation link to complete your registration");
      } else {
        // Handle successful registration with automatic confirmation
        toast.success("Account created successfully");
        
        // Prefetch user data for improved performance
        if (data?.user?.id) {
          await prefetchUserData(data.user.id);
        }
        
        if (options?.onSuccess) {
          options.onSuccess();
        }
        
        if (options?.redirectTo) {
          navigate(options.redirectTo);
        } else {
          navigate("/");
        }
      }
      
      return true;
    } catch (error: any) {
      console.error("Sign up error:", error);
      const errorMessage = "An unexpected error occurred during sign up. Please try again.";
      setAuthError(errorMessage);
      
      if (options?.onError) {
        options.onError(errorMessage);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, prefetchUserData, setAuthError, setIsLoading]);

  return { signUp };
};
