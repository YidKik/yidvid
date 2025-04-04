import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManager } from "./useSessionManager";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AdminStatusData {
  isAdmin: boolean;
  userId?: string | null;
}

export const useAuthentication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<any>(null);

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

  const signUp = async (credentials: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp(credentials);

      if (error) {
        setError(error);
        setUser(null);
        toast.error(error.message);
      } else {
        setUser(data.user);
        toast.success("Account created successfully! Check your email to verify.");
      }
    } catch (err: any) {
      setError(err);
      setUser(null);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (credentials: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        setError(error);
        setUser(null);
        toast.error(error.message);
      } else {
        setUser(data.user);
        toast.success("Signed in successfully!");
      }
    } catch (err: any) {
      setError(err);
      setUser(null);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error);
        toast.error(error.message);
      } else {
        setUser(null);
        toast.success("Signed out successfully!");
      }
    } catch (err: any) {
      setError(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error);
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent!");
      }
    } catch (err: any) {
      setError(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        setError(error);
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
      }
    } catch (err: any) {
      setError(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
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
