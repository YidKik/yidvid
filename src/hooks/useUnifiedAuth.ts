
import { useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  display_name?: string;
  is_admin: boolean;
  avatar_url?: string;
  username?: string;
}

interface UnifiedAuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  error: string | null;
}

export const useUnifiedAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Derived state
  const user = session?.user || null;
  const isAuthenticated = !!session?.user;
  const userId = user?.id;

  console.log("useUnifiedAuth state:", {
    hasSession: !!session,
    hasUser: !!user,
    userId,
    isAuthenticated,
    isLoading
  });

  // Fetch user profile data
  const { 
    data: profile, 
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No userId for profile fetch");
        return null;
      }

      console.log("Fetching profile for user:", userId);
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("Profile fetch error:", error);
          throw error;
        }

        if (!data) {
          console.warn("No profile found, creating minimal profile");
          return {
            id: userId,
            email: user?.email || "",
            is_admin: false
          } as UserProfile;
        }

        console.log("Profile fetched successfully:", data);
        
        // Cache admin status for quick access
        if (data.is_admin) {
          queryClient.setQueryData(["admin-status", userId], { isAdmin: true });
        }

        return data as UserProfile;
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        
        // Return fallback profile to prevent complete failure
        return {
          id: userId,
          email: user?.email || "",
          is_admin: false
        } as UserProfile;
      }
    },
    enabled: !!userId && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.code === 'PGRST116' || error?.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000
  });

  // Initialize session and set up auth listener
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting initial session:", error);
          setError(error.message);
        } else {
          console.log("Initial session:", !!initialSession?.user);
          setSession(initialSession);
        }
      } catch (err: any) {
        console.error("Failed to initialize auth:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, !!currentSession?.user);
        
        setSession(currentSession);
        setError(null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          console.log("User signed in, triggering profile fetch");
          // Small delay to ensure session is stable
          setTimeout(() => {
            refetchProfile();
          }, 100);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing profile data");
          queryClient.removeQueries({ queryKey: ["user-profile"] });
          queryClient.removeQueries({ queryKey: ["admin-status"] });
          queryClient.removeQueries({ queryKey: ["channel-subscriptions"] });
        }
      }
    );

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, refetchProfile]);

  // Sign out function
  const signOut = useCallback(async () => {
    console.log("Signing out user");
    setIsLoading(true);
    
    try {
      // Clear cache first
      queryClient.clear();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        setError(error.message);
      } else {
        console.log("Sign out successful");
        setSession(null);
        setError(null);
      }
    } catch (err: any) {
      console.error("Unexpected sign out error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  // Refresh profile data
  const refreshProfile = useCallback(() => {
    console.log("Manually refreshing profile");
    refetchProfile();
  }, [refetchProfile]);

  const authState: UnifiedAuthState = {
    session,
    user,
    profile,
    isAuthenticated,
    isLoading,
    isProfileLoading,
    error: error || profileError?.message || null
  };

  return {
    ...authState,
    signOut,
    refreshProfile,
    // Legacy compatibility
    handleLogout: signOut,
    isLoggingOut: isLoading && !session
  };
};
