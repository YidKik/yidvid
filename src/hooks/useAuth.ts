
import { useAuthentication } from "./useAuthentication";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Simplified authentication hook for components that only need
 * basic authentication state and logout functionality
 */
export const useAuth = () => {
  const auth = useAuthentication();
  
  // Verify the auth session status whenever this hook is used
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session in useAuth:", error);
        } else {
          console.log("Session check in useAuth:", !!data.session?.user);
          
          if (data.session?.user) {
            // Verify the user actually exists in the database
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("id, email")
              .eq("id", data.session.user.id)
              .single();
              
            console.log("Profile check result:", 
              profileError ? "Error: " + profileError.message : 
              profileData ? "Profile found" : "No profile found");
          }
        }
      } catch (err) {
        console.error("Unexpected error in session check:", err);
      }
    };
    
    checkSession();
  }, []);
  
  return {
    session: auth.user,
    isAuthenticated: !!auth.user,
    handleLogout: auth.signOut,
    isLoggingOut: auth.isLoading && !auth.user,
    isLoading: auth.isLoading
  };
};
