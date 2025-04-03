
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Custom hook to check and manage admin status
 */
export const useAdminStatus = (userId: string | undefined) => {
  const [isAdminCheckComplete, setIsAdminCheckComplete] = useState(false);
  
  // Check for PIN bypass
  const hasPinBypass = localStorage.getItem('admin-pin-bypass') === 'true';

  // First check if we have cached admin status
  const { data: cachedAdminStatus } = useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;
      
      // Try to get cached admin status first
      const cached = JSON.parse(localStorage.getItem(`admin-status-${session.user.id}`) || 'null');
      if (cached) {
        console.log("Using locally cached admin status:", cached);
        return cached;
      }
      return null;
    },
    staleTime: Infinity,
  });

  // Fetch session data
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["dashboard-session"],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session found");
        return session;
      } catch (error) {
        console.error("Session error:", error);
        throw error;
      }
    },
    retry: 2,
  });

  // Then query the profile with better error handling
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["dashboard-admin-check", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      // Check for PIN bypass first
      if (hasPinBypass) {
        console.log("Using PIN bypass for admin access");
        return { is_admin: true, id: session.user.id };
      }
      
      // Check for cached admin status
      if (cachedAdminStatus?.isAdmin === true) {
        console.log("Using cached admin status for dashboard");
        return { is_admin: true, id: session.user.id };
      }
      
      console.log("Dashboard: Explicitly checking admin status for:", session.user.id);
      
      try {
        // Make a direct and simple query for just the admin status
        const { data, error } = await supabase
          .from("profiles")
          .select("id, is_admin")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching admin status:", error);
          toast.error("Failed to verify admin permissions");
          throw error;
        }

        console.log("Dashboard: Admin check result:", data);
        
        // Cache the admin status for future quick access
        if (data?.is_admin === true) {
          // Set in query cache for future use
          localStorage.setItem(`admin-status-${session.user.id}`, JSON.stringify({ isAdmin: true }));
          console.log("Admin status cached in localStorage");
        }
        
        return data;
      } catch (error) {
        console.error("Admin status check error:", error);
        throw error;
      }
    },
    enabled: !!session?.user?.id,
    retry: 3,
    staleTime: 10000, // Cache for a short time
    retryDelay: attempt => Math.min(attempt * 1000, 5000), // Exponential backoff
  });

  // We need to handle admin check completion separately from the query
  useEffect(() => {
    if (!isProfileLoading) {
      setIsAdminCheckComplete(true);
    }
  }, [isProfileLoading]);

  // Calculate the final admin status
  const isAdmin = profile?.is_admin === true || hasPinBypass;

  // Return all relevant data and state
  return {
    isAdmin,
    profile,
    session,
    isSessionLoading,
    isProfileLoading,
    isAdminCheckComplete,
    hasPinBypass
  };
};
