
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SignInFormField } from "./SignInFormField";
import { SignInErrorMessage } from "./SignInErrorMessage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loginError: string;
  setLoginError: (error: string) => void;
  onBackToSignIn: () => void;
}

export const ForgotPasswordForm = ({
  email,
  setEmail,
  isLoading,
  setIsLoading,
  loginError,
  setLoginError,
  onBackToSignIn,
}: ForgotPasswordFormProps) => {
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const isMobile = useIsMobile();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setLoginError("Please enter your email address to reset your password");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      console.log("Sending password reset email to:", email);
      console.log("Redirect URL:", `${window.location.origin}/reset-password`);
      
      // IMPORTANT: Remove protocol from redirect URL as Supabase adds it
      const redirectUrl = window.location.origin.replace(/^https?:\/\//, '') + '/reset-password';
      console.log("Formatted redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Password reset error:", error);
        setLoginError(error.message);
      } else {
        setResetEmailSent(true);
        toast.success("Password reset email sent. Please check your inbox.");
      }
    } catch (error: any) {
      console.error("Error in password reset:", error);
      setLoginError(error.message || "An error occurred while sending the reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleForgotPassword} className={`space-y-${isMobile ? '3' : '4'}`}>
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Reset Password</h3>
        <p className="text-sm text-gray-500">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <SignInFormField
        type="email"
        placeholder="Email"
        value={email}
        onChange={setEmail}
        disabled={isLoading || resetEmailSent}
      />
      
      <SignInErrorMessage error={loginError} />
      
      {resetEmailSent && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-green-700 text-sm">
          Check your email for a password reset link. You can close this window.
        </div>
      )}
      
      <Button
        type="submit"
        className={`w-full ${isMobile 
          ? 'h-10 text-sm py-0' 
          : 'h-12 text-base py-0'} 
          mt-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium
          transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
          hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-md hover:shadow-lg`}
        disabled={isLoading || resetEmailSent}
      >
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>
      
      <div className="text-center mt-4">
        <button 
          type="button" 
          onClick={onBackToSignIn}
          className="text-sm text-purple-600 hover:text-purple-800"
        >
          Back to Sign In
        </button>
      </div>
    </form>
  );
};
