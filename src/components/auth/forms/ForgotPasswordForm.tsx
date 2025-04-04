
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SignInFormField } from "./SignInFormField";
import { SignInErrorMessage } from "./SignInErrorMessage";
import { useAuthentication } from "@/hooks/useAuthentication";
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
  const { resetPassword, isLoading: authLoading, authError, isPasswordResetSent, setAuthError } = useAuthentication();
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const isMobile = useIsMobile();

  // Sync loading state with authentication hook
  useEffect(() => {
    setIsLoading(authLoading);
  }, [authLoading, setIsLoading]);
  
  // Sync error state with authentication hook
  useEffect(() => {
    setLoginError(authError);
  }, [authError, setLoginError]);

  // Sync reset email state with authentication hook
  useEffect(() => {
    setResetEmailSent(isPasswordResetSent);
  }, [isPasswordResetSent]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    await resetPassword(email);
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
          mt-3 bg-[#ea384c] hover:bg-red-700 text-white rounded-lg font-medium
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
          className="text-sm text-[#ea384c] hover:text-red-700"
        >
          Back to Sign In
        </button>
      </div>
    </form>
  );
};
