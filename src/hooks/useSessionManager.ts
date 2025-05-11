
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

export const useSessionManager = () => {
  const { session, isLoading } = useSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // Check if user is authenticated
  const isAuthenticated = !!session?.user;

  // Enhanced logging to debug authentication state
  useEffect(() => {
    if (session?.user) {
      console.log("Session user detected:", session.user.email);
    } else {
      console.log("No session user detected in useSessionManager");
    }
  }, [session?.user]);

  // Session data query
  const { data: sessionData, refetch } = useQuery({
    queryKey: ["session-data"],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Error fetching session data:", err);
        return null;
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 60000, // 1 minute
  });

  // Function to refresh session data
  const refreshSession = async () => {
    try {
      console.log("Refreshing session data");
      const result = await refetch();
      return !!result.data;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return false;
    }
  };

  // Function to handle sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Function to open sign in dialog
  const handleSignInClick = () => {
    setIsAuthOpen(true);
  };

  return {
    session,
    sessionData,
    isLoading,
    isAuthenticated,
    refreshSession,
    handleSignOut,
    handleSignInClick,
    isAuthOpen,
    setIsAuthOpen
  };
};
