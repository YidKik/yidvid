
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManager } from "./useSessionManager";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface AuthCredentials {
  email: string;
  password: string;
}

interface AdminStatusData {
  isAdmin: boolean;
  userId?: string | null;
}

export const useAuthentication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [authError, setAuthError] = useState<string>("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);

  // Derive authentication status from user
  const isAuthenticated = !!user;

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { user, session }, error } = await supabase.auth.getUser();

        if (error) {
          setError(error);
          setUser(null);
          setSession(null);
        } else {
          setUser(user);
          setSession(session);
        }
      } catch (err: any) {
        setError(err);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const signUp = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    setError(null);
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.signUp(credentials);

      if (error) {
        setError(error);
        setUser(null);
        setAuthError(error.message);
        toast.error(error.message);
      } else {
        setUser(data.user);
        setSession(data.session);
        toast.success("Account created successfully! Check your email to verify.");
      }
    } catch (err: any) {
      setError(err);
      setUser(null);
      setAuthError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
    
    return { success: !error }; // Return an object instead of void
  };

  const signIn = async (credentials: AuthCredentials, options?: { redirectTo?: string; onSuccess?: () => void }) => {
    setIsLoading(true);
    setError(null);
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        setError(error);
        setUser(null);
        setAuthError(error.message);
        toast.error(error.message);
      } else {
        setUser(data.user);
        setSession(data.session);
        toast.success("Signed in successfully!");
        
        if (options?.onSuccess) {
          options.onSuccess();
        }
      }
    } catch (err: any) {
      setError(err);
      setUser(null);
      setAuthError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
    
    return { success: !error }; // Return an object instead of void
  };

  const signOut = async () => {
    setIsLoading(true);
    setIsLoggingOut(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error);
        setAuthError(error.message);
        toast.error(error.message);
      } else {
        setUser(null);
        setSession(null);
        toast.success("Signed out successfully!");
      }
    } catch (err: any) {
      setError(err);
      setAuthError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
      setIsLoggingOut(false);
    }
    
    return { success: !error }; // Return an object instead of void
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setAuthError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error);
        setAuthError(error.message);
        toast.error(error.message);
        setIsPasswordResetSent(false);
      } else {
        setIsPasswordResetSent(true);
        toast.success("Password reset email sent!");
      }
    } catch (err: any) {
      setError(err);
      setAuthError(err.message);
      toast.error(err.message);
      setIsPasswordResetSent(false);
    } finally {
      setIsLoading(false);
    }
    
    return { success: !error && isPasswordResetSent }; // Return an object instead of void
  };

  const updatePassword = async (password: string) => {
    setIsLoading(true);
    setError(null);
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        setError(error);
        setAuthError(error.message);
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
      }
    } catch (err: any) {
      setError(err);
      setAuthError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
    
    return { success: !error }; // Return an object instead of void
  };

  return {
    user,
    session,
    isLoading,
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
  const { session } = useSessionManager();
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
