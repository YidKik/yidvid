import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSignIn } from "./auth/useAuthSignIn";
import { useAuthSignUp } from "./auth/useAuthSignUp";
import { useAuthSignOut } from "./auth/useAuthSignOut";
import { useAuthPasswordReset } from "./auth/useAuthPasswordReset";
import { useAuthBase } from "./auth/useAuthBase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAuthentication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Use specialized auth hooks
  const { signIn } = useAuthSignIn();
  const { signUp } = useAuthSignUp();
  const { signOut } = useAuthSignOut();
  const { resetPassword, updatePassword, isPasswordResetSent } = useAuthPasswordReset();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          setError(error);
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (err: any) {
        setError(err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isPasswordResetSent,
    authError: error?.message || "",
    setAuthError: (message: string) => setError(message ? new Error(message) : null)
  };
};

interface AdminStatusData {
  isAdmin: boolean;
  userId?: string | null;
}

export const useAdminStatus = () => {
  const { session } = useAuthBase();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  const { data: status, isLoading } = useQuery({
    queryKey: ["admin-status", userId],
    queryFn: async () => {
      if (!userId) return { isAdmin: false };
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userId)
          .single();
          
        if (error || !data) {
          console.error("Error checking admin status:", error);
          return { isAdmin: false };
        }
        
        return { 
          isAdmin: !!data.is_admin,
          userId: userId
        };
      } catch (err) {
        console.error("Unexpected error checking admin status:", err);
        return { isAdmin: false };
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Fix the TypeScript error by ensuring we're passing an object
  useEffect(() => {
    if (userId) {
      // Use the correct type for the admin status data
      const adminData: AdminStatusData = { isAdmin: false };
      queryClient.setQueryData(["admin-status", userId], adminData);
    }
  }, [userId, queryClient]);

  return {
    isAdmin: status?.isAdmin || false,
    isLoading,
  };
};
