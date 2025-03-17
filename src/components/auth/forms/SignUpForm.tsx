import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SignUpFormField } from "./SignUpFormField";
import { TermsCheckbox } from "./TermsCheckbox";
import { SocialLoginButtons } from "../SocialLoginButtons";
import { validateSignUpForm } from "@/utils/formValidation";

interface SignUpFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onOpenChange?: (open: boolean) => void;
}

export const SignUpForm = ({ isLoading, setIsLoading, onOpenChange }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSignUpForm(email, password, username);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setIsLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        toast.error(signUpError.message || "Error during sign up");
        return;
      }

      if (signUpData?.user) {
        // Directly sign in after successful signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.error("Auto sign-in error:", signInError);
          toast.error("Account created but couldn't sign in automatically. Please sign in manually.");
          return;
        }

        toast.success("Welcome to the platform!");
        if (onOpenChange) {
          onOpenChange(false);
        }
        navigate("/");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error("An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <SignUpFormField
        type="text"
        placeholder="Username"
        value={username}
        onChange={setUsername}
        disabled={isLoading}
      />
      
      <SignUpFormField
        type="email"
        placeholder="Email"
        value={email}
        onChange={setEmail}
        disabled={isLoading}
      />
      
      <SignUpFormField
        type="password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
        disabled={isLoading}
        minLength={6}
      />
      
      {!isMobile && <TermsCheckbox disabled={isLoading} />}
      
      <Button
        type="submit"
        variant="outline"
        className={`w-full ${isMobile 
          ? 'h-10 text-sm py-0' 
          : 'h-12 text-base py-0'} 
          mt-2 border-purple-500 bg-white text-[#8B5CF6] hover:bg-purple-50 hover:border-purple-500
          rounded-lg font-medium transition-all duration-300 disabled:opacity-50 
          disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] 
          disabled:hover:scale-100 shadow-sm hover:shadow-md`}
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
      
      <SocialLoginButtons />
    </form>
  );
};
