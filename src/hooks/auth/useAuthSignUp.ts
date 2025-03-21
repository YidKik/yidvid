
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthBase } from "./useAuthBase";
import { AuthCredentials, AuthOptions } from "./useAuthSignIn";

export const useAuthSignUp = () => {
  const {
    navigate,
    queryClient,
    setIsLoading,
    setAuthError,
    prefetchUserData
  } = useAuthBase();

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
      
      const isEmailConfirmationSent = data?.user && data.user.identities && data.user.identities.length === 0;
      
      if (isEmailConfirmationSent) {
        toast.success("Please check your email for a confirmation link to complete your registration");
      } else {
        toast.success("Account created successfully");
        
        // Prefetch user data in the background if we have a user ID
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
