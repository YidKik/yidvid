
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SignInFormField } from "./SignInFormField";
import { SignInErrorMessage } from "./SignInErrorMessage";
import { useSignIn } from "@/hooks/useSignIn";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SignInFormProps {
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const SignInForm = ({ onOpenChange, isLoading, setIsLoading }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const isMobile = useIsMobile();
  
  const { 
    signIn, 
    loginError, 
    setLoginError,
    isLoading: isSigningIn
  } = useSignIn({ 
    onSuccess: () => onOpenChange(false) 
  });

  // Sync the parent's loading state with our internal state
  const handleIsLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  // Watch for changes in our internal loading state
  useEffect(() => {
    handleIsLoadingChange(isSigningIn);
  }, [isSigningIn]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn({ email, password });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setLoginError("Please enter your email address to reset your password");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setLoginError(error.message);
      } else {
        setResetEmailSent(true);
        toast.success("Password reset email sent. Please check your inbox.");
      }
    } catch (error: any) {
      setLoginError(error.message || "An error occurred while sending the reset link");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setForgotPasswordMode(!forgotPasswordMode);
    setLoginError("");
    setResetEmailSent(false);
  };

  // Render the forgot password form
  if (forgotPasswordMode) {
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
            onClick={toggleForgotPassword}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            Back to Sign In
          </button>
        </div>
      </form>
    );
  }

  // Render the sign in form
  return (
    <form onSubmit={handleSignIn} className={`space-y-${isMobile ? '3' : '4'}`}>
      <SignInFormField
        type="email"
        placeholder="Email"
        value={email}
        onChange={setEmail}
        disabled={isLoading}
      />
      
      <SignInFormField
        type="password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
        disabled={isLoading}
        minLength={6}
      />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="remember" 
            className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Remember me</label>
        </div>
        <button 
          type="button" 
          onClick={toggleForgotPassword}
          className="text-sm text-purple-600 hover:text-purple-800"
        >
          Forgot password?
        </button>
      </div>
      
      <SignInErrorMessage error={loginError} />
      
      <Button
        type="submit"
        className={`w-full ${isMobile 
          ? 'h-10 text-sm py-0' 
          : 'h-12 text-base py-0'} 
          mt-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium
          transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
          hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-md hover:shadow-lg`}
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      {!isMobile && (
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-sm text-gray-400">Or continue with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
      )}

      {!isMobile && (
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className="flex justify-center items-center py-2 px-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="h-5 w-5 mr-2" />
            <span className="text-sm">Google</span>
          </button>
          <button
            type="button"
            className="flex justify-center items-center py-2 px-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" alt="Facebook" className="h-5 w-5 mr-2" />
            <span className="text-sm">Facebook</span>
          </button>
          <button
            type="button"
            className="flex justify-center items-center py-2 px-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/0/747.png" alt="Apple" className="h-5 w-5 mr-2" />
            <span className="text-sm">Apple</span>
          </button>
        </div>
      )}
    </form>
  );
};
