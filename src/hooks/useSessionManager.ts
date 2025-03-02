
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useSessionManager = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        if (initialSession) {
          console.log("Initial session loaded:", initialSession.user?.email);
          setSession(initialSession);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event);
          switch (event) {
            case 'SIGNED_IN':
              setSession(currentSession);
              // Invalidate profile query to ensure fresh data
              if (currentSession?.user?.id) {
                queryClient.invalidateQueries({ queryKey: ["profile", currentSession.user.id] });
              }
              break;
            case 'TOKEN_REFRESHED':
              setSession(currentSession);
              break;
            case 'SIGNED_OUT':
              setSession(null);
              // Clear all user-related queries from cache
              queryClient.clear();
              navigate('/');
              break;
            case 'USER_UPDATED':
              setSession(currentSession);
              // Invalidate profile query after user update
              if (currentSession?.user?.id) {
                queryClient.invalidateQueries({ queryKey: ["profile", currentSession.user.id] });
              }
              break;
          }
        });

        return () => subscription?.unsubscribe();
      } catch (error) {
        console.error("Error initializing session:", error);
        setSession(null);
      }
    };

    initializeSession();
  }, [navigate, queryClient]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        return;
      }
      setSession(null);
      // Clear all query cache on logout
      queryClient.clear();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      navigate("/");
    }
  };

  return { session, handleLogout };
};
