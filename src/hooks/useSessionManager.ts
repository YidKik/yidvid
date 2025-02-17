
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSessionManager = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

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
              break;
            case 'TOKEN_REFRESHED':
              setSession(currentSession);
              break;
            case 'SIGNED_OUT':
              setSession(null);
              navigate('/');
              break;
            case 'USER_UPDATED':
              setSession(currentSession);
              break;
          }
        });

        return () => subscription?.unsubscribe();
      } catch (error) {
        console.error("Error initializing session:", error);
        setSession(null);
        toast.error("There was an error with authentication. Please try logging in again.");
      }
    };

    initializeSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        toast.error("There was an issue logging out");
        return;
      }
      setSession(null);
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      navigate("/");
    }
  };

  return { session, handleLogout };
};
