
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthBase } from "./useAuthBase";

export const useAuthPasswordReset = () => {
  const {
    setIsLoading,
    setAuthError
  } = useAuthBase();
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    if (!email) {
      setAuthError("Please enter your email address to reset your password");
      return false;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      console.log("Sending password reset email to:", email);
      
      // IMPORTANT: Remove protocol from redirect URL as Supabase adds it
      const redirectUrl = window.location.origin.replace(/^https?:\/\//, '') + '/reset-password';
      console.log("Formatted redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Password reset error:", error);
        setAuthError(error.message);
        return false;
      } 
      
      setIsPasswordResetSent(true);
      toast.success("Password reset email sent. Please check your inbox.");
      return true;
    } catch (error: any) {
      console.error("Error in password reset:", error);
      setAuthError(error.message || "An error occurred while sending the reset link");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setAuthError, setIsLoading]);

  // Update password (after reset)
  const updatePassword = useCallback(async (newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      setAuthError("Password must be at least 6 characters");
      return false;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      console.log("Attempting to update password...");
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        console.error("Password update error:", error);
        setAuthError(error.message);
        return false;
      }
      
      toast.success("Password updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error during password update:", error);
      setAuthError(error.message || "An error occurred while updating your password");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setAuthError, setIsLoading]);

  return { 
    resetPassword, 
    updatePassword, 
    isPasswordResetSent 
  };
};
