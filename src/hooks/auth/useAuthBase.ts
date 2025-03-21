
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";

/**
 * Base authentication hook that provides shared state and utilities
 * for all authentication operations. Acts as the foundation for other
 * auth hooks.
 */
export const useAuthBase = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Clears any authentication errors from state
   */
  const clearErrors = useCallback(() => {
    setAuthError("");
  }, []);

  /**
   * Prefetches user profile data after successful authentication
   * to improve user experience by having data ready when needed
   * 
   * @param userId - The authenticated user's ID
   */
  const prefetchUserData = useCallback(async (userId: string) => {
    try {
      // Prefetch user profile - improves UX by having data ready when profile page loads
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
      
      // Prefetch admin status - needed for UI permission controls
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

  return {
    navigate,
    session,
    queryClient,
    isLoading,
    setIsLoading,
    authError,
    setAuthError,
    isLoggingOut,
    setIsLoggingOut,
    clearErrors,
    prefetchUserData,
    isAuthenticated: !!session
  };
};
