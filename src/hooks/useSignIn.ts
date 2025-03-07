
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { validateSignInForm } from "@/utils/formValidation";

export interface SignInCredentials {
  email: string;
  password: string;
}

interface UseSignInProps {
  onSuccess?: () => void;
}

export const useSignIn = ({ onSuccess }: UseSignInProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const prefetchUserData = async (userId: string) => {
    try {
      queryClient.prefetchQuery({
        queryKey: ["profile", userId],
        queryFn: async () => {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .maybeSingle();
              
            if (error) {
              console.error("Error prefetching profile:", error);
              return null;
            }
            
            console.log("Prefetched profile after sign in:", data);
            return data;
          } catch (err) {
            console.error("Error prefetching profile:", err);
            return null;
          }
        },
        retry: 1,
        meta: {
          errorBoundary: false
        }
      });
      
      queryClient.prefetchQuery({
        queryKey: ["user-profile"],
        queryFn: async () => {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("is_admin")
              .eq("id", userId)
              .single();
              
            if (error) {
              console.error("Error prefetching user-profile:", error);
              return null;
            }
            
            console.log("Prefetched user-profile after sign in:", data);
            return data;
          } catch (err) {
            console.error("Error prefetching user-profile:", err);
            return null;
          }
        },
        retry: 1,
        meta: {
          errorBoundary: false
        }
      });
    } catch (err) {
      console.error("Failed to prefetch profile data:", err);
      // Don't block authentication if profile fetching fails
    }
  };

  const signIn = async (credentials: SignInCredentials) => {
    const { email, password } = credentials;
    
    const validation = validateSignInForm(email, password);
    if (!validation.valid) {
      setLoginError(validation.message || "Invalid form data");
      return false;
    }

    setLoginError("");
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
          setLoginError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setLoginError(signInError.message || "Error during sign in");
        }
        return false;
      }

      if (signInData?.user) {
        console.log("User signed in successfully:", signInData.user.email);
        
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["user-profile"] });
        
        // Prefetch user data in the background
        await prefetchUserData(signInData.user.id);
        
        toast.success("Signed in successfully!");
        
        if (onSuccess) {
          onSuccess();
        }
        
        navigate("/");
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Sign in error:", error);
      setLoginError("An unexpected error occurred during sign in. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
    loginError,
    setLoginError
  };
};
