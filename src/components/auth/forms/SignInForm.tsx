
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSignIn } from "@/hooks/useSignIn";
import { SignInFormContent } from "./SignInFormContent";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { toast } from "sonner";

interface SignInFormProps {
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  hideRememberMe?: boolean;
  hideSocialButtons?: boolean;
}

export const SignInForm = ({ 
  onOpenChange, 
  isLoading, 
  setIsLoading, 
  hideRememberMe = false,
  hideSocialButtons = false 
}: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginAttempted, setLoginAttempted] = useState(false);
  const isMobile = useIsMobile();
  
  const { 
    signIn, 
    loginError, 
    setLoginError,
    isLoading: isSigningIn
  } = useSignIn({ 
    onSuccess: () => {
      toast.success("Signed in successfully!", { id: "signin-success" });
      onOpenChange(false);
    }
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
    setLoginAttempted(true);
    
    // Clear any previous errors
    setLoginError("");
    
    if (!email.trim() || !password.trim()) {
      setLoginError("Please enter both email and password");
      return;
    }
    
    try {
      const success = await signIn({ email, password });
      
      // Only close dialog and show success toast if sign-in was successful
      if (success) {
        toast.success("Signed in successfully!", { id: "signin-success" });
        onOpenChange(false);
      } else if (loginAttempted) {
        // If login was attempted but not successful, ensure error is displayed
        if (!loginError) {
          setLoginError("Login failed. Please check your credentials and try again.");
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setLoginError("Failed to sign in. Please try again.");
    }
  };

  // Render the sign in form
  return (
    <>
      <SignInFormContent
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        loginError={loginError}
        handleSignIn={handleSignIn}
        onForgotPassword={() => {}} // Keeping the prop but using empty function
        hideRememberMe={hideRememberMe}
      />

      {!hideSocialButtons && <SocialLoginButtons />}
    </>
  );
};
