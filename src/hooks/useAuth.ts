
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        toast.error("Error during logout: " + error.message);
        return;
      }
      
      // Clear all query cache on logout
      queryClient.clear();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast.error("Unexpected error during logout");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    session,
    isAuthenticated: !!session,
    handleLogout,
    isLoggingOut
  };
};
