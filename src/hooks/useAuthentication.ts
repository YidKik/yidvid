import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { prefetchUserData } from "@/utils/userDataPrefetch";
import { Session, User } from "@supabase/supabase-js";

export const useAuthentication = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authError, setAuthError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setUser(newSession?.user ?? null);
        setSession(newSession);
        setIsAuthenticated(!!newSession?.user);
        setIsLoading(false);
        
        if (event === "SIGNED_IN" && newSession) {
          // Prefetch user data after sign-in
          await prefetchUserData(newSession, queryClient);
        }
      }
    );

    // Initial session check
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setUser(data?.session?.user ?? null);
        setSession(data?.session);
        setIsAuthenticated(!!data?.session?.user);
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError(err instanceof Error ? err : new Error('Authentication error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  const signUp = useCallback(
    async (credentials: AuthCredentials) => {
      try {
        setIsLoading(true);
        setError(null);
        setAuthError("");

        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              name: credentials.name,
            },
          },
        });

        if (error) {
          console.error("Signup error:", error);
          setAuthError(error.message);
          return false;
        }

        if (!data.user) {
          console.warn("No user returned after signup");
          return false;
        }

        return true;
      } catch (err) {
        console.error("Unexpected signup error:", err);
        setError(err instanceof Error ? err : new Error('Signup failed'));
        setAuthError("Signup failed. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signIn = useCallback(
    async (
      credentials: AuthCredentials,
      options?: { onSuccess?: () => void }
    ) => {
      try {
        setIsLoading(true);
        setError(null);
        setAuthError("");

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          console.error("Signin error:", error);
          setAuthError(error.message);
          return false;
        }

        if (options?.onSuccess) {
          options.onSuccess();
        }

        return true;
      } catch (err) {
        console.error("Unexpected signin error:", err);
        setError(err instanceof Error ? err : new Error('Signin failed'));
        setAuthError("Signin failed. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // Cancel all in-flight queries immediately
      queryClient.cancelQueries();
      
      // Save public content data before logout to preserve user experience
      const videosData = queryClient.getQueryData(["youtube_videos"]);
      const channelsData = queryClient.getQueryData(["youtube_channels"]);
      
      // Track if we had real content before logout
      const hasVideos = Array.isArray(videosData) && videosData.length > 0;
      const hasChannels = Array.isArray(channelsData) && channelsData.length > 0;
      
      // IMMEDIATE ACTION: Navigate to welcome page
      // This provides instant feedback that logout is happening
      navigate("/");
      
      // Clear all user-specific data from the query cache IMMEDIATELY
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["user-profile-settings"] });
      queryClient.removeQueries({ queryKey: ["admin-section-profile"] });
      queryClient.removeQueries({ queryKey: ["user-video-interactions"] });
      queryClient.removeQueries({ queryKey: ["video-notifications"] });
      queryClient.removeQueries({ queryKey: ["session"] });
      
      // Force session to null in any cache
      queryClient.setQueryData(["session"], null);
      
      // Restore public content data to prevent blank screen
      if (hasVideos && videosData) {
        queryClient.setQueryData(["youtube_videos"], videosData);
      }
      
      if (hasChannels && channelsData) {
        queryClient.setQueryData(["youtube_channels"], channelsData);
      }
      
      // Perform actual Supabase logout in background
      // Even if this is slow, the UI has already updated
      await supabase.auth.signOut();
      
      return { success: true };
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      // Still navigate home even if there's an error
      navigate("/");
      return { success: false };
    } finally {
      setIsLoggingOut(false);
    }
  }, [navigate, queryClient]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setAuthError("");
      setIsPasswordResetSent(false);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        setAuthError(error.message);
        return false;
      }

      setIsPasswordResetSent(true);
      return true;
    } catch (err) {
      console.error("Unexpected password reset error:", err);
      setError(err instanceof Error ? err : new Error('Password reset failed'));
      setAuthError("Password reset failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setAuthError("");

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Update password error:", error);
        setAuthError(error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Unexpected update password error:", err);
      setError(err instanceof Error ? err : new Error('Password update failed'));
      setAuthError("Password update failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    isLoggingOut,
    error,
    authError,
    isPasswordResetSent,
    setAuthError,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  };
};

// Export additional types for other modules
export type AuthCredentials = {
  email: string;
  password: string;
  name?: string; 
};
