
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSignIn } from "@/hooks/useSignIn";
import { SignInFormContent } from "./SignInFormContent";
import { SocialLoginButtons } from "./SocialLoginButtons";

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
