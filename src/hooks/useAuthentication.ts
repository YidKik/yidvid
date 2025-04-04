import { User, Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { useQuery } from "@tanstack/react-query";
import { useAuthSignIn } from "./auth/useAuthSignIn";
import { useAuthSignUp } from "./auth/useAuthSignUp";
import { useAuthSignOut } from "./auth/useAuthSignOut";
import { useAuthPasswordReset } from "./auth/useAuthPasswordReset";
import { useAuthBase } from "./auth/useAuthBase";

export interface AuthCredentials {
  email: string;
  password: string;
}

interface AdminStatusData {
  isAdmin: boolean;
  userId?: string | null;
}

export const useAuthentication = () => {
  // Get the base auth state
  const {
    isLoading: baseIsLoading,
    authError,
    setAuthError,
    isLoggingOut,
    session,
    isAuthenticated
  } = useAuthBase();

  // Get user state from session
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Hook into specialized auth operations
  const { signIn } = useAuthSignIn();
  const { signUp } = useAuthSignUp();
  const { signOut } = useAuthSignOut();
  const { 
    resetPassword, 
    updatePassword, 
    isPasswordResetSent 
  } = useAuthPasswordReset();

  // Keep local user state in sync with session
  useEffect(() => {
    setUser(session?.user || null);
  }, [session]);

  // Initial user fetch
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user, session }, error } = await supabase.auth.getUser();

        if (error) {
          setError(error);
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (err: any) {
        setError(err);
        setUser(null);
      } 
    };

    fetchUser();
  }, []);

  return {
    user,
    session,
    isLoading: baseIsLoading,
    error,
    authError,
    setAuthError,
    isAuthenticated,
    isLoggingOut,
    isPasswordResetSent,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
};

export const useAdminStatus = () => {
  const { session } = useSession();
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

  // Add TypeScript type annotation
  useEffect(() => {
    if (userId) {
      const adminData: AdminStatusData = { isAdmin: false, userId };
      queryClient.setQueryData(["admin-status", userId], adminData);
    }
  }, [userId, queryClient]);

  return {
    isAdmin: status?.isAdmin || false,
    isLoading,
  };
};
