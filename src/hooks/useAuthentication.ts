
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";
import { validateSignInForm } from "@/utils/formValidation";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useAuthentication = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Clear any authentication errors
  const clearErrors = useCallback(() => {
    setAuthError("");
  }, []);

  // Handle prefetching user data after authentication
  const prefetchUserData = useCallback(async (userId: string) => {
    try {
      // Prefetch user profile
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
            
            console.log("Prefetched profile after authentication:", data);
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
      
      // Prefetch admin status
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
            
            console.log("Prefetched user-profile after authentication:", data);
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
    }
  }, [queryClient]);

  // Sign in with email and password
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
  }, [navigate, prefetchUserData, queryClient]);

  // Sign up with email and password
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
  }, [navigate, prefetchUserData]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // Save important content data before logout
      const videosData = queryClient.getQueryData(["youtube_videos"]);
      const channelsData = queryClient.getQueryData(["youtube_channels"]);
      
      // Track if we had real content before logout (improved check)
      const hasVideos = Array.isArray(videosData) && videosData.length > 0;
      const hasChannels = Array.isArray(channelsData) && channelsData.length > 0;
      
      console.log(`Before logout: Has videos: ${hasVideos ? 'Yes' : 'No'}, Has channels: ${hasChannels ? 'Yes' : 'No'}`);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        toast.error("Error during logout: " + error.message);
        return;
      }
      
      // First invalidate only user-specific queries to avoid unnecessary fetches
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-video-interactions"] });
      
      // Restore videos and channels data immediately to prevent blank screen
      if (hasVideos && videosData) {
        console.log("Restoring videos data after logout", videosData.length);
        queryClient.setQueryData(["youtube_videos"], videosData);
      }
      
      if (hasChannels && channelsData) {
        console.log("Restoring channels data after logout", channelsData.length);
        queryClient.setQueryData(["youtube_channels"], channelsData);
      }
      
      // If we didn't have data before, trigger a fresh fetch immediately
      if (!hasVideos) {
        console.log("No videos to restore, invalidating to trigger fetch");
        queryClient.invalidateQueries({ queryKey: ["youtube_videos"] });
      }
      
      if (!hasChannels) {
        console.log("No channels to restore, invalidating to trigger fetch");
        queryClient.invalidateQueries({ queryKey: ["youtube_channels"] });
      }
      
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast.error("Unexpected error during logout");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  }, [navigate, queryClient]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    if (!email) {
      setAuthError("Please enter your email address to reset your password");
      return false;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      console.log("Sending password reset email to:", email);
      
      // IMPORTANT: Remove protocol from redirect URL as Supabase adds it
      const redirectUrl = window.location.origin.replace(/^https?:\/\//, '') + '/reset-password';
      console.log("Formatted redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Password reset error:", error);
        setAuthError(error.message);
        return false;
      } 
      
      setIsPasswordResetSent(true);
      toast.success("Password reset email sent. Please check your inbox.");
      return true;
    } catch (error: any) {
      console.error("Error in password reset:", error);
      setAuthError(error.message || "An error occurred while sending the reset link");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update password (after reset)
  const updatePassword = useCallback(async (newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      setAuthError("Password must be at least 6 characters");
      return false;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      console.log("Attempting to update password...");
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        console.error("Password update error:", error);
        setAuthError(error.message);
        return false;
      }
      
      toast.success("Password updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error during password update:", error);
      setAuthError(error.message || "An error occurred while updating your password");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Auth state
    session,
    isAuthenticated: !!session,
    isLoading,
    isLoggingOut,
    authError,
    isPasswordResetSent,
    
    // Auth methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearErrors,
    setAuthError
  };
};
