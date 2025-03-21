
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthBase } from "./useAuthBase";

/**
 * Hook that handles password reset functionality
 * Depends on useAuthBase for shared authentication state
 */
export const useAuthPasswordReset = () => {
  const {
    setIsLoading,
    setAuthError
  } = useAuthBase();
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);

  /**
   * Initiates the password reset process by sending a reset email
   * 
   * @param email - User's email address for password reset
   * @returns Promise resolving to boolean indicating success/failure
   */
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
      // This avoids the double-protocol issue in reset links (http://http://)
      const redirectUrl = window.location.origin.replace(/^https?:\/\//, '') + '/reset-password';
      console.log("Formatted redirect URL:", redirectUrl);
      
      // Request password reset email from Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Password reset error:", error);
        setAuthError(error.message);
        return false;
      } 
      
      // Update UI state to show confirmation message
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

  /**
   * Completes the password reset process by setting a new password
   * Called after user clicks the reset link in their email
   * 
   * @param newPassword - New password to set
   * @returns Promise resolving to boolean indicating success/failure
   */
  const updatePassword = useCallback(async (newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      setAuthError("Password must be at least 6 characters");
      return false;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      console.log("Attempting to update password...");
      // Update user's password through Supabase
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
