
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

export const useAuthSignIn = () => {
  const {
    navigate,
    queryClient,
    isLoading,
    setIsLoading,
    setAuthError,
    prefetchUserData
  } = useAuthBase();

  const signIn = useCallback(async (credentials: AuthCredentials, options?: AuthOptions) => {
    const { email, password } = credentials;
    
    // Validate form inputs
    const validation = validateSignInForm(email, password);
    if (!validation.valid) {
      setAuthError(validation.message || "Invalid form data");
      return false;
    }

    setAuthError("");
    setIsLoading(true);

    try {
      console.log("Attempting to sign in with email:", email);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        
        if (signInError.message === "Invalid login credentials") {
          setAuthError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setAuthError(signInError.message || "Error during sign in");
        }
        
        if (options?.onError) {
          options.onError(signInError.message);
        }
        
        return false;
      }

      if (signInData?.user) {
        console.log("User signed in successfully:", signInData.user.email);
        
        // Clear stale user data
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["user-profile"] });
        
        // Prefetch user data in the background
        await prefetchUserData(signInData.user.id);
        
        toast.success("Signed in successfully!");
        
        if (options?.onSuccess) {
          options.onSuccess();
        }
        
        if (options?.redirectTo) {
          navigate(options.redirectTo);
        } else {
          navigate("/");
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Sign in error:", error);
      const errorMessage = "An unexpected error occurred during sign in. Please try again.";
      setAuthError(errorMessage);
      
      if (options?.onError) {
        options.onError(errorMessage);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, prefetchUserData, queryClient, setAuthError, setIsLoading]);

  return { signIn };
};
